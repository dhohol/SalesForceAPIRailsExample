class CreateDesigns < ActiveRecord::Migration
  def change
    create_table :designs do |t|
      t.boolean :agree_before_signin
      t.boolean :print_after_signin
      t.boolean :email_after_signin
      t.boolean :password_required
      t.string  :password_hash
      t.string  :default_email
      t.string  :title
      t.string  :subtitle
      t.string  :font
      t.string  :font_color
      t.string  :badge_logo
      t.text    :agreement_text

      t.timestamps
    end
  end
end
