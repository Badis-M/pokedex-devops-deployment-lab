output "vpc_id" {
  description = "VPC ID created for the project."
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "Public subnet ID used by the EC2 instance."
  value       = aws_subnet.public.id
}