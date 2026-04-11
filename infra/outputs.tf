output "name_servers" {
  value = data.aws_route53_zone.main.name_servers
}

output "apex_record" {
  value = aws_route53_record.apex.fqdn
}
