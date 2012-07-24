class AddQrHashToVisitor < ActiveRecord::Migration
  def change
    add_column :visitors, :qr_hash, :string
  end
end
