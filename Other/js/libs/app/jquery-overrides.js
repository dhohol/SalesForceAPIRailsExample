define(function() {
  var overrides = {
    click:     false,
    fadeIn:    false,
    fadeOut:   false,
    slideUp:   false,
    slideDown: false
  };
  
  function argCheck(fn) {
    var times = {fast: 200, slow: 600};
    return function(duration, callback) {
      if( typeof duration === 'string' )
        duration = times[duration];
      else if( typeof duration === 'function' ) {
        callback = duration;
        duration = 400;
      } else
        duration = duration || 400;
      fn.call(this, duration, callback);
    }
  }

  return {
    click: function ($) {
      if( !document.documentElement.hasOwnProperty('ontouchstart')
       || overrides.click !== false) return;
      overrides.click = $.fn.click;
      $.fn.click = function(callback) {
        if( arguments.length !== 1 )
          overrides.click.apply(this, arguments);
        else
          $(this).on('touchend', callback);
      }
    },

    fade: function($) {
      if( overrides.fadeIn  !== false
       && overrides.fadeOut !== false )
        return;
      // track display attrs and time labels
      var displays = {};
      // custom implementation
      function fade(show, time, callback) {
        callback = callback || false;
        var $this = $(this)
          , display = displays[this.id];
        if( show && display === 'none' ) {
          display = 'block';
          displays[this.id] = display;
        }
        $this.css({
          '-webkit-transition': 'opacity '+ time +'ms',
          'opacity': show ? 0 : 1
        });
        if( show )
          $this.css('display', (display || 'block'));
        $this.on('webkitTransitionEnd', function() {
          $this.css('-webkit-transition', 'none')
            .off('webkitTransitionEnd');
          if( !show )
            $this.css('display', 'none');
          if( callback !== false )
            callback.call(this);
        });        
        setTimeout(function() {
          $this.css('opacity', show ? 1 : 0);
        });
      }
      // save the old implementation
      overrides.fadeIn  = $.fn.fadeIn;
      overrides.fadeOut = $.fn.fadeOut;
      $.fn.fadeIn = argCheck(function(duration, callback) {
        fade.call(this, true, duration, callback);
      });      
      $.fn.fadeOut = argCheck(function(duration, callback) {
        displays[this.id] = $(this).css('display');
        fade.call(this, false, duration, callback);
      });      
    },
    
    slide: function($) {
      if( overrides.slideUp   !== false
       && overrides.slideDown !== false )
        return;
      var css = {};
      function slide(show, time, callback) {
        var $this = $(this), id = this.id;
        if( show ) {
          var display = $this.css('display');
          if( display === 'none' ) display = 'block';
          css[id] = css[id] || {
            display:   display,
            marginTop: $this.css('marginTop')
          };
        }
        var height = parseInt($this.css('top').replace('px',''));
        height = $this.height() + (isNaN(height) ? 0 : height);
        $this.css({
          display:   (css[id].display || 'block'),
          marginTop: (show ? -1.2 * height : (css[id].marginTop || 0))
        }).on('webkitTransitionEnd', function() {
          $this.off('webkitTransitionEnd').css('-webkit-transition', 'none');
          if( typeof callback !== 'undefined' )
            callback.call(this);
        });
        setTimeout(function() {
          $this.css({
            'margin-top': (show ? (css[id].marginTop || 0) : -1.2 * height),
            '-webkit-transition': 'margin-top '+ time +'ms'
          });
        });
      }
      // save the old implementation
      overrides.slideUp   = $.fn.slideUp;
      overrides.slideDown = $.fn.slideDown;
      $.fn.slideUp = argCheck(function(duration, callback) {
        slide.call(this, false, duration, callback);
      });
      $.fn.slideDown = argCheck(function(duration, callback) {
        slide.call(this, true, duration, callback);
      });
    }
  };
});
