#!/usr/bin/ruby
require 'rubygems'
require 'nokogiri'

# define your WebWorks config.xml helper methods here
def increment_widget_version(doc)
  doc.css('widget').each do |node|
    v = node['version'].split('.')
    v << (v.pop.to_i + 1)
    node['version'] = v.join('.')
  end
end

def set_development_name(doc)
  doc.css('widget name').each do |node|
    unless node.content.include?(' (dev)')
      node.content = "#{node.content} (dev)"
    end
  end
end

def set_release_name(doc)
  doc.css('widget name').each do |node|
    node.content = node.content.gsub(' (dev)','')
  end
end

# add them as a command-line option
@opts = {
  :increment   => method(:increment_widget_version),
  :development => method(:set_development_name),
  :release     => method(:set_release_name)
}

def main
  config = File.open('config.xml')
  doc = Nokogiri::XML(config)
  ARGV.each do |action|
    @opts[action.to_sym].call(doc)
  end
  config = File.open('config.xml', 'w')
  config.write(doc.to_s)
end
main

