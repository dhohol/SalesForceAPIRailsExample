define(['jquery-overrides'], function(jQueryOverrides) {
  var urls = {
    heroku: 'http://caf-wheatley.herokuapp.com',
    andrew: 'http://10.172.69.2:3000'
  };

  function jQuery($) {
    jQueryOverrides.click($); // ontouch vs. onclick
    jQueryOverrides.fade($);  // hw accell. css transition
  }

  return {
    RailsApp: urls.andrew,
    jQuery:   jQuery
  };
});
