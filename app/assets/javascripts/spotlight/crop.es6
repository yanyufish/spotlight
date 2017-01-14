export default class Crop {
  constructor(cropArea) {
    this.cropArea = cropArea;
    this.cropSelector = '[data-cropper="' + cropArea.data('cropper') + '"]';
    this.iiifUrlField = $('#' + cropArea.data('iiif-url-field'));
    this.form = cropArea.closest('form');
    this.initialCropRegion = [0, 0, cropArea.data('crop-width'), cropArea.data('crop-height')];
    this.tileSource = null;

    this.setupAutoCompletes();
    this.setupAjaxFileUpload();
    this.setupExistingIiiifCropper();
    this.setupFormSubmit();
  }

  // Set the Crop tileSource and setup the cropper
  setTileSource(source) {
    this.tileSource = source;
    this.setupIiifCropper();
  }

  // TODO: Add accessors to update hidden inputs with IIIF uri/ids?

  // Setup autocomplete inputs to have the iiif_cropper context
  setupAutoCompletes() {
    var input = $('[data-behavior="autocomplete"]' + this.cropSelector, this.form);
    input.data('iiifCropper', this);
  }

  setupAjaxFileUpload() {
    this.fileInput = $('input[type="file"]' + this.cropSelector, this.form);
    this.fileInput.change(() => this.uploadFile());
  }

  // Setup the cropper on page load if the field
  // that holds the IIIF url is populated
  setupExistingIiiifCropper() {
    if(this.iiifUrlField.val() === '') {
      return;
    }
    var partsArr = this.iiifUrlField.val().split('/');
    var tileSourceBase = partsArr.slice(0, partsArr.length - 4).join('/');
    this.setTileSource(tileSourceBase + '/info.json');
  }

  setupIiifCropper() {
    if (this.tileSource === null || this.tileSource === undefined) {
      console.error('No tilesource provided when setting up IIIF Cropper');
      return;
    }
    // Open tilesource in existing canvas if present
    if (this.osdCanvas) {
      this.osdCanvas.open(this.tileSource);
      return;
    }
    this.osdCanvas = new OpenSeadragon({
       id: this.cropArea.attr('id'),
       showNavigationControl: false,
       tileSources: [this.tileSource],

       // disable zooming
       gestureSettingsMouse: {
         clickToZoom: false,
         scrollToZoom: false
       },

       // disable panning
       panHorizontal: false,
       panVertical: false

    });

    this.osdCanvas.iiifCrop();
    this.osdCanvas.addHandler('tile-drawn', () => {
      // remove the handler so we only fire on the first instance
      this.osdCanvas.removeHandler('tile-drawn');
      this.applyCurrentRegion();
    });
    this.osdCanvas.cropper.lockAspectRatio()
  }


  // Grab a region from a IIIF url
  getRegionFromIiifUrl(url) {
    if (url === '') {
      return this.initialCropRegion;
    }
    var partsArr = url.split('/');
    return partsArr[partsArr.length-4].split(',').map((x) => parseInt(x));
  }

  setupFormSubmit(iiif_url_field) {
    this.form.on('submit', (e) => {
      this.iiifUrlField.val(this.getIiifRegion());
    });
  }

  applyCurrentRegion() {
    var region = this.getRegionFromIiifUrl(this.iiifUrlField.val());
    this.osdCanvas.cropper.setRegion.apply(this.osdCanvas.cropper, region);
  }

  getIiifRegion() {
    if (!this.osdCanvas || !this.osdCanvas.viewport || !this.osdCanvas.source) {
      return null;
    }
    return this.osdCanvas.cropper.getIiifSelection().getUrl('600,');
  }

  // Get all the form data with the exception of the _method field.
  getData() {
    var data = new FormData(this.form[0]);
    data.append('_method', null);
    return data;
  }

  uploadFile() {
    var url = this.fileInput.data('endpoint')
    // Every post creates a new image/masthead.
    // Because they create IIIF urls which are heavily cached.
    $.ajax({
      url: url,  //Server script to process data
      type: 'POST',
      success: (data, stat, xhr) => this.successHandler(data, stat, xhr),
      // error: errorHandler,
      // Form data
      data: this.getData(),
      //Options to tell jQuery not to process data or worry about content-type.
      cache: false,
      contentType: false,
      processData: false
    });
  }

  successHandler(data, stat, xhr) {
    this.setTileSource(data.tilesource);
  }
}
