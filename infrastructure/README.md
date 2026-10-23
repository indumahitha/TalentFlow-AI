# TalentFlow AI: AWS Infrastructure

## Project Overview
TalentFlow AI is an AI-powered recruitment platform designed to manage job listings, candidate registrations, and resume storage.

## Infrastructure Components
- **Amazon VPC:** Isolated network for application resources.
- **Public Subnets:** Network placement for internet-facing components.
- **Private Subnets:** Planned placement for application and database resources.
- **Internet Gateway:** Internet connectivity for public subnet routing.
- **Security Groups:** Network access restrictions for the load balancer, application, and database.
- **Amazon S3:** Resume storage with public access blocked, server-side encryption, and versioning.

## Infrastructure as Code
Terraform defines the AWS networking, security, and storage configuration.

## Validation
- `terraform init`: Successful
- `terraform validate`: Successful
- `terraform plan`: 16 resources to add, 0 to change, 0 to destroy

## Cost and Deployment
The configuration has been validated and planned. Resources have not been deployed. Review AWS pricing and the proposed resources before any deployment.
