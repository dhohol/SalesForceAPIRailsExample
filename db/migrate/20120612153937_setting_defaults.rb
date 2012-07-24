class SettingDefaults < ActiveRecord::Migration
  def up
    change_table :settings do |t|
      t.change :first_name,        :integer, :default => 1
      t.change :last_name,         :integer, :default => 1
      t.change :company,           :integer, :default => 1
      t.change :address_1,         :integer, :default => 0
      t.change :address_2,         :integer, :default => 0
      t.change :city,              :integer, :default => 0
      t.change :province_state,    :integer, :default => 0
      t.change :postal_zipcode,    :integer, :default => 0 
      t.change :phone,             :integer, :default => 0
      t.change :email,             :integer, :default => 1
      t.change :here_to_see,       :integer, :default => -1
      t.change :guide_escort_name, :integer, :default => -1
      t.change :photo_capture,     :integer, :default => 0
      t.change :signature_capture, :integer, :default => 0
      t.change :vehicle_make,      :integer, :default => 0
      t.change :vehicle_color,     :integer, :default => 0
      t.change :license_plate,     :integer, :default => 0
    end
  end

  def down
    change_table :settings do |t|
      t.change :first_name,        :integer
      t.change :last_name,         :integer
      t.change :company,           :integer
      t.change :address_1,         :integer
      t.change :address_2,         :integer
      t.change :city,              :integer
      t.change :province_state,    :integer
      t.change :postal_zipcode,    :integer
      t.change :phone,             :integer
      t.change :email,             :integer
      t.change :here_to_see,       :integer
      t.change :guide_escort_name, :integer
      t.change :photo_capture,     :integer
      t.change :signature_capture, :integer
      t.change :vehicle_make,      :integer
      t.change :vehicle_color,     :integer
      t.change :license_plate,     :integer      
    end
  end
end
