var blackberry = blackberry || false
  , RailsApp = false
  , FormSettings = false
  , underscore = false
  , Visitor
  , Messages = {}
  , offsets = {
  tgroup: [],
  scroll: 0
};

define([
  'jquery',
  'underscore',
  'backbone',
  'qrcode',
  'qrinit',
  'design',
  'config',
  'loading',
  'models/visitor',
  'text!templates/signIn/page.html'
], function($, _, Backbone, qrcode, qrInit, Design, Config, Loading, _Visitor, signInPageTemplate){
  var load = new Loading({
    timeout:  "Timeout: Unable to reach server",
    waittime: 15000 // 15s default
  });
  Config.jQuery($);
  RailsApp = Config.RailsApp;
  Visitor = _Visitor;
  underscore = _;

  var SignInPage = Backbone.View.extend({
    el: '.page',
    render: function () {
      this.$el.html(signInPageTemplate);
      $(function() {
        qrInit(qrcode, blackberry, '.qrcorner');
        ready();
        $('#emailBeforePhoto').hide();
        // fixing weird bug where draw position is offset on signature canvas
        $(document).scroll(function() {
          offsets.scroll = $(document).scrollTop();
        });
        Design.engage('signin');
        Design.get('message_signin_success', function(val) { Messages.success = val; });
        Design.get('message_signin_fail', function(val) { Messages.fail = val; });
      });
    }
  });
  return SignInPage;
});

function isValidForm() {
  var missed = underscore
    .chain($('form input.required'))
    .filter(function(inEl) { return $(inEl).val() === ""; })
    .value();
  $(missed).each(function() {
    $(this).css('background-color', 'red');
  });
  return missed.length === 0;
}

function addCustomFields(field_data) {
  var _ = underscore;
  var $last = $('.custom_field');
  var $curr = $last;
  _.each(field_data, function(field) {
    var str = ['set_custom_field_' + field.id, 'custom_field_' + field.id];
    $curr = $curr || $last.clone();
    $curr.find('label').attr('for', str[0]).text(field.label);
    $curr.find('input').attr('id',  str[0]).attr('name', str[1]);
    if( $curr === $last )
      $curr.show(); // show if already inserted
    else            // otherwise, just insert
      $curr.insertAfter($last);
    $last = $curr;
    $curr = null;
  });
}

function saveGuest(evt) {
  evt.preventDefault();  
  var _ = underscore;
  var dataArr = $(evt.target).serializeArray()
    , data    = {custom_values_attributes: []};
  // serialization
  _.each(dataArr, function(param) {
    if( param.name.indexOf('custom_field_') >= 0 ) {
      var id = parseInt(param.name.replace('custom_field_',''));
      data.custom_values_attributes.push({
        value: param.value,
        custom_field_id: id
      });
    } else if( param.name !== 'custom_field' )
      data[param.name] = param.value;
  });
  data = {visitor: data};
  // validate and send
  if( isValidForm() ) {
    $('body').scrollTop(0);
    load.start();
    var v = new Visitor(data);
    Visitors.add(v);
    v.save({}, {
      success: function(model, response) {
        load.end(Messages.success, function() {
          window.location.hash = '#';
        });
      },
      error: function(model, response) {
        load.end(Messages.fail);
      }
    });
    load.wait();
  }
  return false;
}

function PhotoCapture(id, button, saveTo) {
  // make sure we have WebWorks api
  if( typeof blackberry === 'undefined' ) {
    console.warn = console.warn || console.log;
    console.warn('Warning: BB WebWorks API not available.');
    return;
  }
  // main PhotoCapture logic
  var iframe  = document.getElementsByTagName('iframe')[0]
    , canvas  = document.getElementById(id)
    , context = canvas.getContext('2d')
    , $button = $(button)
    , $saveTo = $(saveTo);
  $button.click(function() {
    var $email = $('input[name=email]')
      , email  = $email.val();
    if( !emailCheck($email) ) return;
    blackberry.media.camera.takePicture(function(filePath) {
      iframe.contentWindow.S3Upload(filePath, email, function(path) {
        $saveTo.val(path);
        waitToExist(path, function(exists) {
          if( exists )
            load.end('Your photo was successfully captured.');
          else {
            load.end('Warning: your photo upload is taking some time.<ul>'
                   + '<li>The server may be down, or</li>'
                   + '<li>you may be on a poor connection.</li></ul>');
            iframe.src = '/static/upload.html';
          }
        });
      });
    }, function() {
      load.wait(10000); // 10s wait time
    }, function() {
      load.end('There was a problem capturing your photo.');
    });
    load.start();
  });

  function emailCheck($email) {
    var placeholder = $email.attr('placeholder')
      , email = $email.val();
    if( email === "" || email === placeholder ) {
      $email.css('background-color', 'red');
      $('#emailBeforePhoto').show('fast');
      return false;
    } else {
      $email.css('background-color', 'white');
      $('#emailBeforePhoto').hide('fast');
      return true;
    }
  }

  function waitToExist(path, callback, wait, limit) {
    wait  = wait  || 500;
    limit = limit || 15;
    var tries = 1;
    var c = new XMLHttpRequest();
    recheck();
    function state() {
      if( c.readyState < 2 )
        return; // not ready
      else {
        c.onreadystatechange = null;
        c.abort();
        if( c.status !== 200 && tries !== limit ) {
          setTimeout(function() {
            recheck(c);
          }, wait);
          tries++;
        } else
          callback(c.status === 200);
      }
    }
    function recheck() {
      c.open('GET', path, true);
      c.onreadystatechange = state;
      c.send();
    }
  }
}

function CanvasCapture(id, saveTo) {
  var canvas  = document.getElementById(id)
    , context = canvas.getContext('2d')
    , hideTimeout = false
    , down = false;
  $(canvas).on('touchmove', function(evt) {
    evt.preventDefault();
    if( !down ) return;
    var t = evt.originalEvent.targetTouches[0]
      , x = t.clientX - t.target.offsetLeft
      , y = t.clientY - t.target.offsetTop
      , offset = 0;
    underscore.each(offsets.tgroup, function(o) { offset += o; });
    offset += offsets.scroll;
    x = Math.floor(x * 0.85);
    y = Math.floor(y * 1.3 + offset);
    context.lineTo(x, y);
    context.stroke();
    return false;
  }).on('touchstart', function(e) {
    down = true;
    if( hideTimeout !== false )
      clearTimeout(hideTimeout);
    canvas.width = canvas.width;
    context.beginPath();
  }).on('touchleave', out)
    .on('touchend', out);
  $('#signature_display').click(function() {
    $(canvas).css('display', 'inline-block').animate({
      height:  '3.25em',
      opacity: 1
    });
  });
  function out() {
    down = false;
    $(saveTo).val(canvas.toDataURL());
    hideTimeout = setTimeout(function() {
      $('#signature_display').text('Thanks');
      $(canvas).css('display', 'none').animate({
        height:  0,
        opacity: 0
      });
    }, 500);
  }
}

function ready() {
  function applySettings(data) {
    FormSettings = data;
    $('div.custom_field').hide();
    for(var key in data) {
      var $div = $('#'+key+'_div');
      if( key === 'custom_fields_attributes' )
        addCustomFields(data[key]);
      else if( data[key] == -1 )  // hidden field
        $div.hide();
      else if( data[key] == 1 ) { // required field
        $div.addClass('required');
        $div.find('input').addClass('required');
      }
    }
  }
  
  // load settings
  if( FormSettings === false ) {
    $.ajax(RailsApp + '/settings/getSettings.json?callback=?', {
      crossDomain: true,
      dataType: 'jsonp',
      success: applySettings
    });
  } else applySettings(FormSettings);

  // setup signature capture
  CanvasCapture('signature_canvas', 'input[name=signature_capture]');
  // setup photo capture
  PhotoCapture('photo_canvas', '#take_picture', 'input[name=photo_capture]');

  // hide agreement + handle agree/disagree
  $('#agreement').hide();
  $('#agreement .agree').click(function() {
    $('#agreement').fadeOut();
  });
  $('#agreement .disagree').click(function() {
    window.location.hash = '';
    window.location.reload();
  });
  
  // prepopulate email form
  var mail = localStorage.getItem('quick_email') || false
    , defaultMail = $('#email_div input[name=email]').val();
  // strip whitespace
  while( defaultMail.search(' ') !== -1 )
    defaultMail = defaultMail.replace(' ','');
  if( mail !== false ) {
    $('#email_div input[name=email]').val(mail);
    localStorage.removeItem('quick_email');
  } else if( defaultMail.length > 0 )
    $('#email_div input[name=email]').val(defaultMail);

  // expandable fields
  $('.tgroup').click(function() {
    // fixing weird bug where draw position is offset on signature canvas
    offsets.tgroup.push($(this).find('fieldset').length * 10);
    $(this).removeClass('collapsed');
  });
};
