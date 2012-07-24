class Base64SigCapture < ActiveRecord::Migration
  def up
    change_table :visitors do |t|
      t.change :signature_capture, :text
    end
  end

  def down
    change_table :visitors do |t|
      t.change :signature_capture, :string
    end
  end
end
