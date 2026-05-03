output "app_security_group_id" {
  description = "Security group ID attached to the application EC2 instance."
  value       = aws_security_group.app.id
}

output "instance_profile_name" {
  description = "IAM instance profile name used by the EC2 instance for SSM."
  value       = aws_iam_instance_profile.ec2_ssm.name
}