output "bucket_name" {
  description = "Private S3 bucket used by Ansible SSM connection for temporary file transfers."
  value       = aws_s3_bucket.ansible_transfer.bucket
}