#########################################
# LOCALS
#########################################
locals {
  frontend_repo = "${var.project_name}-frontend"
  backend_repo  = "${var.project_name}-backend"
  name_prefix   = "${var.project_name}-app"
}

#########################################
# DATA SOURCES
#########################################

# Default VPC
data "aws_vpc" "default" {
  default = true
}

# Default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Ubuntu AMI (22.04 LTS)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

#########################################
# ECR REPOSITORIES
#########################################
resource "aws_ecr_repository" "frontend" {
  name = local.frontend_repo

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "backend" {
  name = local.backend_repo

  image_scanning_configuration {
    scan_on_push = true
  }
}

#########################################
# SECURITY GROUP (HTTP + SSH)
#########################################
resource "aws_security_group" "web_sg" {
  name        = "${local.name_prefix}-sg"
  description = "Allow HTTP + SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allow_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#########################################
# IAM ROLE FOR EC2 (ECR PULL + SSM)
#########################################
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_role" {
  name               = "${local.name_prefix}-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "ecr_pull" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.name_prefix}-profile"
  role = aws_iam_role.ec2_role.name
}

#########################################
# EC2 INSTANCE (Docker, Compose, ECR pull, App deploy)
#########################################
resource "aws_instance" "app" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.micro"
  subnet_id                   = data.aws_subnets.default.ids[0]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids      = [aws_security_group.web_sg.id]
  key_name                    = var.key_name != "" ? var.key_name : null

  tags = {
    Name = local.name_prefix
  }

  user_data = <<-EOF
#!/bin/bash
set -e

# Install dependencies
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release awscli docker.io

systemctl enable docker
systemctl start docker

# Install docker-compose
curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Get account ID + login to ECR
ACCOUNT_ID=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | grep accountId | awk -F'"' '{print $4}')
AWS_REGION="${var.aws_region}"

aws ecr get-login-password --region $AWS_REGION \
    | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create app directory
mkdir -p /opt/app

# Write docker-compose file
cat >/opt/app/docker-compose.prod.yml <<EOT
services:
  frontend:
    image: $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/stylevault-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/stylevault-backend:latest
    environment:
      MONGO_URI: mongodb://mongo:27017/admin
    depends_on:
      - mongo

  mongo:
    image: mongo:4.4
    command: --bind_ip_all
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
EOT

cd /opt/app

docker-compose -f docker-compose.prod.yml pull || true
docker-compose -f docker-compose.prod.yml up -d

EOF
}
