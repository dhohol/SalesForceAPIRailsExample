class AddMessageOptions < ActiveRecord::Migration
  def up
    change_table :designs do |t|
      t.string :message_signin_success
      t.string :message_signin_fail
      t.string :message_signout_success
      t.string :message_signout_fail
    end
  end

  def down
    change_table :designs do |t|
      t.remove :message_signin_success
      t.remove :message_signin_fail
      t.remove :message_signout_success
      t.remove :message_signout_fail
    end
  end
end
