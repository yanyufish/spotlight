module Spotlight
  # View helpers for the ExhibitsController
  module ExhibitsHelper
    # use the specified crop points, but a bigger image than the thumbnail
    def card_image(exhibit)
      exhibit.thumbnail.iiif_url
    end
  end
end
