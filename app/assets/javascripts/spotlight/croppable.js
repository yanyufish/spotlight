Spotlight.onLoad(function() {
  $('[data-behavior="iiif-cropper"]').croppable();
});


/*
  IIIF image cropping plugin
  Add iiif-crop data-attributes to file input (with data-croppable='true') to instantiate.
*/

var xosd;  // TODO debug -- remove.
(function($) {
  $.fn.croppable = function() {
    var croppables = this;

    var Crop = require('spotlight/crop');
    $(croppables).each(function() {
      var cropElement = $(this);
      new Crop(cropElement);
    });

    return this;
  };
})(jQuery);
