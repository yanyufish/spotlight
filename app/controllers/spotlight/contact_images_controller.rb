module Spotlight
  # Handles requests to upload images for contact images
  class ContactImagesController < FeaturedImagesController
    private

    def create_params
      { image: params[:contact]
        .fetch(:avatar_attributes, {})
        .fetch(:file, {}) }
    end
  end
end
