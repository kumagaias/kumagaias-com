# 既存のホストゾーンを参照
data "aws_route53_zone" "main" {
  name         = var.domain
  private_zone = false
}

# GitHub Pages の Apex ドメイン (A レコード)
resource "aws_route53_record" "apex" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain
  type    = "A"
  ttl     = 3600

  records = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
  ]
}

# www → apex へリダイレクト用 CNAME
resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.domain}"
  type    = "CNAME"
  ttl     = 3600
  records = [var.domain]
}
