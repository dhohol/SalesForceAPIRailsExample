class DecoupleDesignSettings < ActiveRecord::Migration
  def up
    change_table :settings do |t|
      t.remove :use_landscape_photoseries
      t.remove :use_flora_photo_series
      t.remove :print_after_sign_in
      t.remove :email_after_sign_in
      t.remove :default_email
      t.remove :title
      t.remove :subtitle
      t.remove :font
      t.remove :font_color
      t.remove :show_agreement_upon_sign_in
      t.remove :visitor_agreement_text
      t.remove :password_required
      t.remove :password
    end
  end

  def down
    change_table :settings do |t|
      t.boolean :use_landscape_photoseries
      t.boolean :use_flora_photo_series
      t.boolean :print_after_sign_in
      t.boolean :email_after_sign_in
      t.string  :default_email
      t.string  :title
      t.string  :subtitle
      t.string  :font
      t.string  :font_color
      t.boolean :show_agreement_upon_sign_in
      t.string  :visitor_agreement_text
      t.boolean :password_required
      t.string  :password
    end
  end
end
