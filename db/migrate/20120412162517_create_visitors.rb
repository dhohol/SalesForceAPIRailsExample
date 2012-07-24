class CreateVisitors < ActiveRecord::Migration
  def change
    create_table :visitors do |t|
      t.string :first_name
      t.string :last_name
      t.string :company
      t.string :address
      t.string :city
      t.string :province_state
      t.string :postal_zipcode
      t.integer :phone
      t.string :email
      t.string :badge_returned
      t.integer :badge_number
      t.string :vehicle_make
      t.string :color
      t.string :license_plate
      t.string :custom_field

      t.timestamps
    end
  end
end
