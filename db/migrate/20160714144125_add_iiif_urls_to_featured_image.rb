class AddIiifUrlsToFeaturedImage < ActiveRecord::Migration
  def change
    add_column :spotlight_featured_images, :iiif_url, :string
    add_column :spotlight_featured_images, :iiif_manifest, :string
    add_column :spotlight_featured_images, :iiif_canvas, :string
    add_column :spotlight_featured_images, :iiif_image, :string
  end
end
