class CreateCustomValues < ActiveRecord::Migration
  def change
    create_table :custom_values do |t|
      t.integer :custom_field_id
      t.integer :visitor_id
      t.string  :value

      t.timestamps
    end
  end
end
