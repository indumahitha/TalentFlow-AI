
output "vpc_id" {
  description = "ID of the TalentFlow AI VPC"
  value       = aws_vpc.talentflow_vpc.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value = [
    aws_subnet.public_a.id,
    aws_subnet.public_b.id
  ]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]
}

output "alb_security_group_id" {
  description = "Security group ID for the load balancer"
  value       = aws_security_group.alb.id
}

output "app_security_group_id" {
  description = "Security group ID for the application"
  value       = aws_security_group.app.id
}

output "database_security_group_id" {
  description = "Security group ID for the database"
  value       = aws_security_group.database.id
}

output "ecr_repository_url" {
  description = "ECR repository URL for the TalentFlow AI backend"
  value       = aws_ecr_repository.backend.repository_url
}


