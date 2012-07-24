class MissingFieldsAndConsistency < ActiveRecord::Migration
  def up  
    change_table :visitors do |t|
      # unused
      t.remove :badge_returned
      t.remove :badge_number
      # missing
      t.string :here_to_see
      t.string :guide_escort_name
      t.string :photo_capture
      t.string :signature_capture
      t.rename :color, :vehicle_color
    end

    change_table :settings do |t|
      # unused
      t.remove :badge_returned
      t.remove :badge_number
      # inconsistent
      t.rename :address,  :address_1
      t.rename :address2, :address_2
    end
  end

  def down
    change_table :visitors do |t|
      t.string  :badge_returned
      t.integer :badge_number
      t.remove  :here_to_see
      t.remove  :guide_escort_name
      t.remove  :photo_capture
      t.remove  :signature_capture
      t.rename  :vehicle_color, :color
    end

    change_table :settings do |t|
      t.integer :badge_returned
      t.integer :badge_number
      t.rename  :address_1, :address
      t.rename  :address_2, :address2
    end
  end
end
