// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'pages',
], function ($, _, Backbone, Pages) {
  var AppRouter = Backbone.Router.extend({
    routes: {
      // Pages
      '/admin' : 'admin',
      '/signOut': 'signOut',
      '/signIn': 'signIn',
      
      // Default - catch all
      '*actions': 'defaultAction'
    },
    signOut: function () {
      var signout = new Pages.SignOut();
      signout.render();
    },
    signIn: function () {
      var signin = new Pages.SignIn();
      signin.render();
    },
    main: function () {
      var main = new Pages.Main();
      main.render();
    },
    admin: function () {
      var admin = new Pages.Admin();
      admin.render();
    },
    defaultAction: function(actions){
      // We have no matching route, lets display the dashboard 
      this.main();
    }
  });

  return {
    initialize: function() {
      $(function() {
        var app_router = new AppRouter();
        Backbone.history.start();
      });
    }
  };
});

