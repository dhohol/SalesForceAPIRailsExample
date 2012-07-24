var blackberry = blackberry || false
  , RailsApp = false;

define([
  'jquery',
  'underscore',
  'backbone',
  'qrcode',
  'qrinit',
  'design',
  'config',
  'text!templates/main/page.html'
], function($, _, Backbone, qrcode, qrInit, Design, Config, mainPageTemplate){
  Config.jQuery($);
  RailsApp = Config.RailsApp;
  localStorage.removeItem('quick_email');

  function ready() {
    function ifEmailVal(callback) {
      return function(e) {
        var inputVal  = $('input.quickUse').val()
          , prevented = (inputVal !== "");
        if( prevented ) {
          e.preventDefault();
          callback.call(this, e, inputVal);
        }
        return !prevented;
      };
    }
    
    $('.login.button.signin').click(ifEmailVal(function(e, addr) {
      $('input.quickUse').val('');
      $.getJSON(RailsApp + '/visitors/signIn.json', {email: addr}, function(data) {
        // refresh page on successful sign-in
        location.hash = "";
      }).error(function() { 
        // go to sign-in page on unrecognized email addr, or on error
        localStorage.setItem('quick_email', addr);
        location.hash = "#/signIn";
      });
    }));
    
    $('.login.button.signout').click(ifEmailVal(function(e, addr) {
      $('input.quickUse').val('');
      $.getJSON(RailsApp + '/visitors/signOut.json', {email: addr}).error(function() {
        location.hash = "#/signOut";
      });
    }));
  };

  var MainPage = Backbone.View.extend({
    el: '.page',
    render: function () {
      $(this.el).html(mainPageTemplate);
      $(document).ready(function() {
        $('#loading').hide();
        qrInit(qrcode, blackberry, '.qrcorner');
        ready();
        Design.engage('main');
        setTimeout(function() {
          $('#appfadein').fadeOut(1500);
        }, 4000);
      });
    }
  });
  return MainPage;
});
