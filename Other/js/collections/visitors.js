define(['backbone', 'underscore', 'config', 'models/visitor'],
  function(Backbone, _, Config, Visitor) {

  var Visitors = Backbone.Collection.extend({
    url: Config.RailsApp + '/visitors.json',
    model: Visitor
  });

  window.Visitors = window.Visitors || new Visitors();
  return window.Visitors;
});
