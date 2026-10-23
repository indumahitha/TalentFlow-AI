terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Networking
resource "aws_vpc" "talentflow_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "talentflow-vpc"
    Project     = "TalentFlow-AI"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.talentflow_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "talentflow-public-a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.talentflow_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "talentflow-public-b"
  }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.talentflow_vpc.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "talentflow-private-a"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.talentflow_vpc.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name = "talentflow-private-b"
  }
}

# Internet connectivity for public subnets
resource "aws_internet_gateway" "talentflow_igw" {
  vpc_id = aws_vpc.talentflow_vpc.id

  tags = {
    Name = "talentflow-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.talentflow_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.talentflow_igw.id
  }

  tags = {
    Name = "talentflow-public-routes"
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# Security groups
resource "aws_security_group" "alb" {
  name        = "talentflow-alb-sg"
  description = "Allow HTTP traffic to the application load balancer"
  vpc_id      = aws_vpc.talentflow_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "talentflow-alb-sg"
  }
}

resource "aws_security_group" "app" {
  name        = "talentflow-app-sg"
  description = "Allow application traffic only from the ALB"
  vpc_id      = aws_vpc.talentflow_vpc.id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "talentflow-app-sg"
  }
}

resource "aws_security_group" "database" {
  name        = "talentflow-database-sg"
  description = "Allow PostgreSQL only from the application security group"
  vpc_id      = aws_vpc.talentflow_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Name = "talentflow-database-sg"
  }
}

# Amazon ECR repository for TalentFlow AI backend
resource "aws_ecr_repository" "backend" {
  name                 = "talentflow-ai-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name        = "TalentFlow AI Backend"
    Project     = var.project_name
    Environment = var.environment
  }
}
