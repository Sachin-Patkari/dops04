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

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

#########################################
# ECR REPOS
#########################################
resource "aws_ecr_repository" "frontend" {
  name = local.frontend_repo
  force_delete = true
}

resource "aws_ecr_repository" "backend" {
  name = local.backend_repo
  force_delete = true
}

#########################################
# SECURITY GROUP
#########################################
resource "aws_security_group" "web_sg" {
  name        = "${local.name_prefix}-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
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
# IAM ROLE
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

resource "aws_iam_role_policy_attachment" "ecr_read" {
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
# EC2 INSTANCE
#########################################
resource "aws_instance" "app" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.micro"
  subnet_id                   = data.aws_subnets.default.ids[0]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids      = [aws_security_group.web_sg.id]

  tags = {
    Name = local.name_prefix
  }

  user_data = <<-EOF
#!/bin/bash
set -e

apt-get update -y
apt-get install -y awscli docker.io
systemctl enable docker
systemctl start docker

# Install Docker Compose v2
curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 \
     -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

ACCOUNT_ID=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | grep accountId | awk -F'"' '{print $4}')
AWS_REGION="${var.aws_region}"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin \
    $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

mkdir -p /opt/app

# Write compose file
cat <<EOT > /opt/app/docker-compose.prod.yml
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

# FIXED — use full path
docker-compose -f /opt/app/docker-compose.prod.yml pull
docker-compose -f /opt/app/docker-compose.prod.yml up -d

EOF
}
