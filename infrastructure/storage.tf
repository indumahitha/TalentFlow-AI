
resource "aws_s3_bucket" "resumes" {
  bucket_prefix = "talentflow-ai-resumes-"

  tags = {
    Name        = "TalentFlow AI Resume Storage"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Keep candidate resumes private
resource "aws_s3_bucket_public_access_block" "resumes" {
  bucket = aws_s3_bucket.resumes.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Encrypt resume files at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "resumes" {
  bucket = aws_s3_bucket.resumes.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Keep previous versions when files are replaced
resource "aws_s3_bucket_versioning" "resumes" {
  bucket = aws_s3_bucket.resumes.id

  versioning_configuration {
    status = "Enabled"
  }
}
