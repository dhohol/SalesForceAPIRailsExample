class CreateCustomFields < ActiveRecord::Migration  
  def up
    create_table :custom_fields do |t|
      t.integer :setting_id
      t.string  :label

      t.timestamps
    end

    remove_column :settings, [
      :custom_field1,
      :custom_field2,
      :custom_field3,
      :custom_field4,
      :custom_field5
    ]
    
    remove_column :visitors, :custom_field
  end

  def down
    drop_table :custom_fields

    change_table :settings do |t|
      t.string :custom_field1
      t.string :custom_field2
      t.string :custom_field3
      t.string :custom_field4
      t.string :custom_field5
    end

    change_table :visitors do |t|
      t.string :custom_field
    end
  end
end
