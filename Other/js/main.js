// Require.js allows us to configure shortcut alias
require.config({
  paths: {    
    // Major libraries
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min', 
    backbone: 'libs/backbone/backbone-min',
    sinon: 'libs/sinon/sinon',
    searchfield: 'libs/searchfield/searchfield',
    simplemodal: 'libs/simplemodal/jquery.simplemodal',
    chosen: 'libs/chosen/chosen.jquery.min',
    Mustache: 'libs/mustache/mustache',
    qrcode: 'libs/qr/QR_require',
    qrinit: 'libs/qr/QR_init',
    design: 'libs/app/design',
    config: 'libs/app/config',
    loading: 'libs/app/loading',
    'jquery-overrides': 'libs/app/jquery-overrides',

    // Require.js plugins
    text:  'libs/require/text',
    pages: 'libs/require/pages',
  
    templates: 'templates'
  }
});

// Let's kick off the application

require([
  'views/app',
  'router',
  'collections/visitors'
], function(AppView, Router){
  var appView = new AppView();
  appView.render();
  Router.initialize();
});

