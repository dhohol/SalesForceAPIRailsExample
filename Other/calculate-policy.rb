#!/usr/bin/ruby

require 'base64'
require 'openssl'
require 'digest/sha1'

secret = "DBQe3lCc0gn6dz24pvmOk1nOzP4oxSGoZ4wy4MKU"
policy_document = <<-eos
{"expiration": "2015-01-01T00:00:00Z",
  "conditions": [
    {"bucket": "factory-wheatley"},
    ["starts-with", "$key", "uploads/"],
    {"acl": "public-read"},
    {"success_action_status": "200"},
    ["starts-with", "$Content-Type", ""],
    ["content-length-range", 0, 5242880],
  ]
}
eos

policy = Base64.encode64(policy_document).gsub("\n","")
signature = Base64.encode64(OpenSSL::HMAC.digest(
              OpenSSL::Digest::Digest.new('sha1'),
              secret, policy)).gsub("\n","")

puts "<input type=\"hidden\" name=\"policy\" value=\"#{policy}\">"
puts "<input type=\"hidden\" name=\"signature\" value=\"#{signature}\">"

