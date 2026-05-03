resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "ansible_transfer" {
  bucket = "${var.project_name}-${var.environment}-ansible-transfer-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_public_access_block" "ansible_transfer" {
  bucket = aws_s3_bucket.ansible_transfer.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ansible_transfer" {
  bucket = aws_s3_bucket.ansible_transfer.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}