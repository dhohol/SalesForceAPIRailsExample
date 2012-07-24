class AddSignInAndSignOuttoVisitors < ActiveRecord::Migration
  def up
  	add_column :visitors, :sign_in, :datetime
  	add_column :visitors, :sign_out, :datetime
  	add_column :visitors, :address_2, :string
  	
  	add_column :visitors, :address_1, :string
  end

  def down
	remove_column :visitors, :sign_in
  	remove_column :visitors, :sign_out
  	remove_column :visitors, :address_2
  	
  	remove_column :visitors, :address_1
  end
end
