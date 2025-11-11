variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "stylevault"
}

variable "key_name" {
  description = "Existing EC2 key pair name (for SSH). Leave empty to skip."
  type        = string
  default     = ""
}

variable "allow_ssh_cidr" {
  description = "Your IP/CIDR for SSH (optional)."
  type        = string
  default     = "0.0.0.0/0"
}
