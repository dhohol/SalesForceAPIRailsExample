class CreateSettings < ActiveRecord::Migration
  def change
    create_table :settings do |t|
      t.integer :id
      t.string :first_name
      t.string :last_name
      t.string :company
      t.string :address
      t.string :city
      t.string :province_state
      t.string :postal_zipcode
      t.integer :phone
      t.string :email
      t.string :here_to_see
      t.string :photo_capture
      t.string :signature_capture
      t.string :guide_escort_name
      t.boolean :badge_returned
      t.integer :badge_number
      t.string :vehicle_make
      t.string :color
      t.string :license_plate
      t.string :custom_field
      t.boolean :use_landscape_photoseries
      t.boolean :use_flora_photo_series
      t.boolean :print_after_sign_in
      t.boolean :email_after_sign_in
      t.string :default_email
      t.string :title
      t.string :subtitle
      t.string :font
      t.string :font_color
      t.boolean :show_agreement_upon_sign_in
      t.string :visitor_agreement_text
      t.boolean :password_required
      t.string :password
      t.datetime :created_at
      t.datetime :updated_at

      t.timestamps
    end
  end
end
