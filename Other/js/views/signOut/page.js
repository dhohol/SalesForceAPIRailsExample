var RailsApp = false
  , Messages = {}
  , load;

define([
  'jquery',
  'underscore',
  'backbone',
  'Mustache',
  'chosen',
  'design',
  'config',
  'loading',
  'text!templates/signOut/page.html'
], function($, _, Backbone, Mustache, chosen, Design, Config, Loading, signOutPageTemplate){
  load = Loading();
  Config.jQuery($);
  RailsApp = Config.RailsApp;

  var SignOutPage = Backbone.View.extend({
    el: '.page',
    render: function () {
      this.$el.html(signOutPageTemplate);
      $('#appfadein').hide();
      
      //Loading current signed in users to chosen logout select
      Visitors.fetch({success: function(visitors, response) {
        var signedIn = visitors.filter(function(v) { return !v.has('sign_out'); });
        if( _.isEmpty(signedIn) ){//if no logged in users tell screen
          $('.chosen').hide();
          $('#signoutMessage').show().text('Currently no visitors are signed in');
        } else {
          $(".chosen").html(Mustache.render("{{#visitors}}<option value='{{id}}'>{{first_name}} {{last_name}}</option>{{/visitors}}", {
            visitors: _.map(signedIn, function(v) { return v.toJSON(); })
          })).chosen();
          $('#signoutMessage').hide();
          $('#done').text('Sign Out').click(signout);
        }
      }});

      // setup messaging
      Design.get('message_signout_success', function(val) { Messages.success = val; });
      Design.get('message_signout_fail', function(val) { Messages.fail = val; });
    }
  });
  return SignOutPage;
});

function signout(e) {
  var counter = (function() {
    var count = 0;
    function CallAfter(n, callback) {
      return function() {
        if( ++count === n ) callback();
      };
    };
    return {CallAfter: CallAfter};
  })();

  e.preventDefault();
  var toSignOut = $('.chosen').val()
    , url       = this.href;
  if( !toSignOut || toSignOut.length == 0 ) return;
  load.start();

  Visitors.each(function(v) {
    if( toSignOut.indexOf(v.get('id').toString()) >= 0 ) {
      v.signOut();
      v.save({}, {
        success: counter.CallAfter(toSignOut.length, function() {
          load.end(Messages.success, function() {
            window.location = url;
          });
        }),
        error: function() {
          load.end(Messages.fail);
        }
      });
    }
  });

  load.wait();
  return false;
}
  
