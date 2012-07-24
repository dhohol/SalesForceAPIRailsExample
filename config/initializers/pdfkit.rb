PDFKit.configure do |config|
  if Rails.env.production?
    config.wkhtmltopdf = Rails.root.join('bin', 'wkhtmltopdf-amd64').to_s
  end
end
