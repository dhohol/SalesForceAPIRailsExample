class FixupSettingFields < ActiveRecord::Migration
  def up
    change_table :settings do |t|
      # renaming columns
      t.integer :address2
      t.integer :vehicle_color
      t.remove  :color
      # support for custom fields
      t.string  :custom_field1
      t.string  :custom_field2
      t.string  :custom_field3
      t.string  :custom_field4
      t.rename  :custom_field,      :custom_field5
      # change column types for settings
      t.change  :first_name,        :integer
      t.change  :last_name,         :integer
      t.change  :company,           :integer
      t.change  :address,           :integer
      t.change  :city,              :integer
      t.change  :postal_zipcode,    :integer
      t.change  :province_state,    :integer
      t.change  :phone,             :integer
      t.change  :email,             :integer
      t.change  :here_to_see,       :integer
      t.change  :photo_capture,     :integer
      t.change  :signature_capture, :integer
      t.change  :guide_escort_name, :integer
      t.change  :badge_returned,    :integer
      t.change  :badge_number,      :integer
      t.change  :vehicle_make,      :integer
      t.change  :license_plate,     :integer
    end
  end

  def down
    change_table :settings do |t|
      # renaming columns
      t.remove :address2
      t.remove :vehicle_color
      t.string :color
      # support for custom fields
      t.remove :custom_field1
      t.remove :custom_field2
      t.remove :custom_field3
      t.remove :custom_field4
      t.rename :custom_field5,     :custom_field
      # change column types for settings
      t.change :first_name,        :string
      t.change :last_name,         :string
      t.change :company,           :string
      t.change :address,           :string
      t.change :city,              :string
      t.change :province_state,    :string
      t.change :postal_zipcode,    :string
      t.change :phone,             :string
      t.change :email,             :string
      t.change :here_to_see,       :string
      t.change :photo_capture,     :string
      t.change :signature_capture, :string
      t.change :guide_escort_name, :string
      t.change :badge_returned,    :string
      t.change :badge_number,      :string
      t.change :vehicle_make,      :string
      t.change :license_plate,     :string
    end
  end
end
