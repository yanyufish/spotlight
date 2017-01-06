module Spotlight
  # Draws DOM elements for working with crop.es6.
  # These consist of:
  #   1) hidden field that associates the image to the parent
  #   2) IIIF URL for the image (crop coordinates)
  #   3) File upload field
  #   4) div for OpenSeadragon to use
  class IIIFCropper
    def initialize(form, name, width, height)
      @form = form
      @name = name
      @width = width
      @height = height
      @base = form.object.model_name.param_key
      @association = form.object.association(name)
      @foreign_key = association.reflection.foreign_key
      @model = association.reflection.klass.model_name
      @selector = "#{model.param_key}_image"
    end

    attr_reader :base, :association, :form, :name, :model, :foreign_key, :selector

    # Draws the complete set of DOM elements.
    #   1) association to the parent
    #   2) IIIF URL for the image
    #   3) File upload field
    #   4) div for openseadragon
    def draw
      hidden_field.concat(nested_form)
    end

    # Draws just the IIIF URL field and the div for openseadragon
    def text_and_display(image_form)
      hidden_input = image_form.hidden_field(:iiif_url, id: url_dom_id)
      hidden_input.concat(display)
    end

    # Draws just the file upload field
    def upload(image_form)
      image_form.file_field_without_bootstrap :file, data: data_attributes
    end

    # Draws just the association to the parent
    def hidden_field
      form.hidden_field foreign_key
    end

    def iiif_hidden_fields(image_form)
      image_form.hidden_field(:iiif_manifest)
                .concat(image_form.hidden_field(:iiif_canvas))
                .concat(image_form.hidden_field(:iiif_image))
    end

    private

    # @return the ActionView context
    def template
      @template ||= form.instance_variable_get(:@template)
    end

    def data_attributes
      {
        endpoint: template.polymorphic_path(model.route_key),
        cropper: name,
        selector: selector
      }
    end

    def nested_form
      nested = nil
      form.fields_for(name) do |image_form|
        nested = upload(image_form).concat(text_and_display(image_form))
      end
      nested
    end

    # Returns the DOM element id that holds the association between the parent
    # object and the image
    def association_dom_id
      "#{base}_#{foreign_key}"
    end

    # Returns the DOM element id that holds the iiif url
    def url_dom_id
      "#{base}_#{name}_attributes_iiif_url"
    end

    def display(data = {})
      template.content_tag :div, '', id: selector, class: 'osd-container', data: data.merge(
        behavior: 'iiif-cropper',
        cropper: name,
        'crop-width': @width,
        'crop-height': @height,
        iiif_url_field: url_dom_id
      )
    end
  end
end
