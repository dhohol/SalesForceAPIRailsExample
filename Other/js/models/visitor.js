define(['backbone', 'underscore'], function(Backbone, _, Visitors) {
  function BeforeSetProperties(properties, callback) {
    // When .set is called on a given property (properties), the callback
    // is fired with the attribute name, last value, and new value. The
    // attribute is set to the return value of the callback.
    // attrs[attr] = callback(attr, lastval, attrs[attr])
    return function(prop, val) {
      var attrs = {}, self = this;
      if( prop === null )
        return Backbone.Model.prototype.set.call(this, prop, val);
      else if( typeof prop == 'string' )
        attrs[prop] = val;
      else attrs = prop;
      _.each(_.keys(attrs), function(attr) {
        if( properties.indexOf(attr) >= 0 )
          attrs[attr] = callback(attr, self.get(attr), attrs[attr]);
        Backbone.Model.prototype.set.call(self, attr, attrs[attr]);
      });
      return this;
    };
  }

  var Visitor = Backbone.Model.extend({
    url: function() {
      var url = Backbone.Model.prototype.url.call(this);
      url = url.replace('.json','') + '.json';
      return url + (url.indexOf('.json') < 0 ? '.json' : '');
    },

    signIn: function() {
      this.set('sign_in', (new Date()).toJSON());
    },

    signOut: function() {
      this.set('sign_out', (new Date()).toJSON());
    },

    set: BeforeSetProperties(['sign_in', 'sign_out'], function(prop, lastVal, val) {
      if( !lastVal ) return val;
      return lastVal + ';' + val;
    })
  });

  return Visitor;
});
