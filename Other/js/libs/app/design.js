define(['jquery', 'underscore', 'config'], function($, _, Config) {
  // Decorator: wraps the passed function in $(document).ready()
  function docready(fn) {
    return function() {
      var args = arguments
        , that = this;
      $(document).ready(function() {
        fn.apply(that, args);
      });
    };
  }
  // Decorator: queues the function for later (trigger)
  var wait = (function() {
    var waiting = {notag: []}
      , fired   = {notag: false};
    function delay(tag, fn) {
      // delay([tag,] fn)
      fn = fn || false;
      if( fn === false ) {
        fn  = tag;
        tag = 'notag';
      }
      return function() {
        var args = arguments;
        if( fired[tag] )
          return fn.apply(this, arguments);
        waiting[tag] = waiting[tag] || [];
        waiting[tag].push([fn, this, arguments]);
      };
    }
    function trigger(tag) {
      tag = tag || 'notag';
      var wasFired = fired[tag] || false;
      fired[tag] = true;
      // trigger the waiting functions
      _.each(waiting[tag], function(w) {
        w[0].apply(w[1], w[2]);
      });
      // clear the list and return status
      waiting[tag] = [];
      return wasFired;
    }
    return {
      delay:   delay,
      trigger: trigger
    };
  })();

  // Actual Settings object
  return (function() {
    var RailsApp = Config.RailsApp;
    var settings = {options: false};
    var pages = {
      main:   [
        'title',
        'subtitle',
        'font',
        'font_color',
        'photoseries'
      ],
      signin: [
        'title',
        'font',
        'font_color',
        'default_email',
        'agreement_text',
        'agree_before_signin'
      ],
      admin: [
        'password_hash',
        'password_required'
      ]
    };

    var setup = {
      photoseries: function(opt) {
        var $bgimg  = $('#bgimage')
          , $fadein = $('#appfadein');
        if( $bgimg.length === 0 ) return;
        $bgimg.empty();
        var photos = opt.series_photos[opt.photoseries]
          , width  = $bgimg.width()
          , height = $bgimg.height()
          , show   = false;
        _.each(photos, function(photo) {
          $('<img/>').attr('src', photo.url).load(function() {
            $(this).height(height);
            $(this).css('marginLeft', -$(this).width()/2);
            if( show === false )
              $fadein.fadeOut(1500, function() { show = true; });
          }).appendTo($('<div></div>').appendTo($bgimg));
        });
        function animate() {
          var $this = $(this);
          var curr = $this.scrollLeft();
          $this.scrollLeft(1000000);
          var max  = $this.scrollLeft()
            , left = (max - curr < 100 ? 0 : (max - curr < width ? max : curr + width));
          $this.scrollLeft(curr).delay(5000).animate({scrollLeft: left}, 750, animate);
        }
        if( photos.length >= 0 )
          animate.apply($bgimg.get(0));
      },
      title: function(opt) {
        $('#title').text(opt);
      },
      subtitle: function(opt) {
        $('#subtitle').text(opt);
      },
      font: function(opt) {
        $('#title,#subtitle').css('font-family', opt);
      },
      font_color: function(opt) {
        $('#title,#subtitle').css('color', opt);
      },
      default_email: function(opt) {
        var $mail = $('#email_div input[name=email]')
          , value = $mail.val();
        while( value.search(' ') !== -1 )
          value.replace(' ','');
        if( value.length > 0 ) return;
        $mail.attr('placeholder', opt);
      },
      agreement_text: function(opt) {
        $('#agreement .text').text(opt);
        wait.trigger('agreement_text');
      },
      agree_before_signin: wait.delay('agreement_text', function(opt) {
        if( opt !== true ) return;
        $('#agreement').fadeIn();
      }),
      password_hash: function(opt) {
        function checkHash() {
          var typed = $('#password_gate input[type=password]').addClass('loading').val();
          $.post(RailsApp + '/design/authorize.json?callback=?',
            {password: typed}, function(response) {
            if( response.success !== true ) return;
            $('#password_gate').fadeOut();
            $('#password_gate input[type=password]').removeClass('loading');
          }).error(function() {
            window.location.hash = '#';
            window.location.reload();
          });
        }
        $('#password_gate input[type=button]').click(checkHash);
        $('#password_gate input[type=password]').keypress(function(e) {
          if( e.which !== 13 ) return;
          e.preventDefault();
          checkHash();
          return false;
        });
        wait.trigger('password_hash');
      },
      password_required: wait.delay('password_hash', function(opt) {
        if( opt !== true ) return;
        $('#password_gate').fadeIn();
        $('#password_gate input[type=password]').focus();
      })
    };
    // Wrap all setup funcitons with docready()
    _.each(_.keys(setup), function(opt) {
      setup[opt] = docready(setup[opt]);
    });

    settings.reload = function(data) {
      function handleData(data) {
        settings.options = data;
        wait.trigger();        
      }
      if( typeof data === 'undefined' )
        $.getJSON(RailsApp + '/design.json?callback=?', handleData);
      else
        handleData(data);
    };
    if( settings.options === false )
      settings.reload();

    settings.get = wait.delay(function(setting, callback) {
      if( typeof callback !== 'function'
        || typeof setting !== 'string' )
        return;
      callback(settings.options.design[setting]);
    });

    settings.engage = wait.delay(function(page) {
      page = page || false;
      var keys = _.keys(setup);
      if( page !== false && pages.hasOwnProperty(page) )
        keys = pages[page];
      if( keys.indexOf('photoseries') < 0 )
        $('#appfadein').hide();
      _.each(keys, function(k) {
        if( k === 'photoseries' )
          setup.photoseries(settings.options);
        else if( settings.options.design.hasOwnProperty(k)
          && setup.hasOwnProperty(k) && k !== 'series_photos' )
          setup[k](settings.options.design[k]);
      });
    });
    return settings;
  })();
});
