define(['jquery'], function($) {  
  function preventMove(e) {
    e.preventDefault();
    return false;
  }

  return function(opts) {
    // options
    opts           = opts           || {};
    opts.timeout   = opts.timeout   || 'Action timed out';
    opts.message   = opts.message   || '#loading .message';
    opts.container = opts.container || '#loading';
    opts.waittime  = opts.waittime  || 5000;
    opts.fadetime  = opts.fadetime  || 1000;
    var error = false
      , $msg  = [], $div = []
      , time  = opts.timeout
      , ended = true
      , self  = {
      init: function() {
        if( $msg.length !== 0
         || $div.length !== 0 )
          return;
        $(function() {
          $msg = $(opts.message);
          $div = $(opts.container);
          $div.hide();
        });
      },
      start: function() {
        ended = false;
        $msg.hide();
        $div.css('top', $('body').scrollTop()).fadeIn();
        $div.on('touchmove', preventMove);
      },
      wait: function(howlong) {
        howlong = howlong || opts.waittime;
        if( error !== false ) return;
        error = setTimeout(function() {
          self.end(opts.timeout);
        }, howlong);
      },
      delay: function(content) {
        $msg.html(content).fadeIn(opts.fadetime);
      },
      end: function(content, callback) {
        // ended prevents ending when nothing to end
        if( ended ) return;
        ended = true;
        callback = callback || false; // optional parameter
        if( error !== false ) {
          clearTimeout(error);
          error = false;
        }
        $msg.html(content).fadeIn(opts.fadetime, function() {
          $div.delay(2 * opts.fadetime).fadeOut(opts.fadetime, function() {
            $div.off('touchmove', preventMove);
            $msg.hide();
            $div.css('top', 0);
            if( callback !== false )
              callback();
          });
        });
      }
    };
    self.init();
    return self;
  };
});
