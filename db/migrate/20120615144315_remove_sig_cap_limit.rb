class RemoveSigCapLimit < ActiveRecord::Migration
  def up
    change_table :visitors do |t|
      t.change :signature_capture, :text, :limit => nil
    end
  end

  def down
    change_table :visitors do |t|
      t.change :signature_capture, :text
    end
  end
end
