class CreateSeriesPhotos < ActiveRecord::Migration
  def change
    create_table :series_photos do |t|
      t.integer :design_id
      t.string  :photo_url
      t.string  :series_tag

      t.timestamps
    end
    
    # also app/models/series_photo.rb:5
    add_index :series_photos, [:series_tag, :photo_url], :unique => true
  end
end
