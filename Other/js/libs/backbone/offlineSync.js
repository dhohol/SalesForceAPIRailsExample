define(['backbone', 'underscore'], function(Backbone, _) {
  if( blackberry === undefined || blackberry.connection === undefined )
    return;
  var oldsync = Backbone.sync
    , hasConn = true
    , connect = blackberry.connection
    , offline = [
    connect.NONE,
    connect.UNKNOWN,
    connect.USB
  ];
  
  function connChange(info) {
    var hadConn = hasConn;
    hasConn = offline.indexOf(info.newType) < 0;
    if( hasConn && !hadConn ) queue.flush();
  }
  connChange({newType: connect.type});
  blackberry.event.addEventListener("connectionchange", connChange);

  var queue = (function() {
    var queue = []
      , clear = ['delete', 'create'];
    function push(method, model, options) {
      var toQueue = {
        method:  method,
        model:   model,
        options: options
      },  onTop = null
        , queueAt = -1;

      _.each(queue, function(q, idx) {
        if( q.model.cid == model.cid ) {
          onTop   = q;
          queueAt = idx;
        }
      });

      if( onTop === null ) {
        queue.push(toQueue);
        return;
      }

      if( clear.indexOf(method) >= 0
        || (method == 'read' && onTop.method == 'read')
        || (method == 'update' && clear.indexOf(onTop.method) < 0) ) {
        queue.splice(queueAt, 1);
        queue.push(toQueue);
        return;
      }
    }

    function flush() {
      _.each(queue, function(q) {
        oldsync(q.method, q.model, q.options);
      });
    }

    return {
      push:  push,
      flush: flush
    };
  });

  Backbone.sync = function(method, model, options) {
    if( hasConn )
      oldsync.call(this, method, model, options);
    else
      queue.push(method, model, options);
  };
});
