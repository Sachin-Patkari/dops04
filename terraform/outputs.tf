output "ec2_public_ip" {
  value       = aws_instance.app.public_ip
  description = "Public IP of the app EC2 instance"
}

output "ec2_instance_id" {
  value       = aws_instance.app.id
  description = "EC2 instance id"
}

output "frontend_ecr" {
  value = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr" {
  value = aws_ecr_repository.backend.repository_url
}
