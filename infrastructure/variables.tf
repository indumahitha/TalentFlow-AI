variable "aws_region" {
  description = "AWS region for TalentFlow AI"
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "development"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "TalentFlow-AI"
}