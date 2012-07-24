var pagetype = 0, load
  , RailsApp = false
  , Design = false
  , FormSettings = false
  , underscore = false;

function changeType(type){
  localStorage.setItem("pageType", type);
}

define([
  'jquery',
  'underscore',
  'backbone',
  'qrcode',
  'design',
  'config',
  'loading',
  'views/admin/basic',
  'text!templates/admin/page.html'
], function($, _, Backbone, qrcode, design, Config, Loading, BasicReady, adminPageTemplate){
  load = Loading({
    timeout:  'Timeout: Could not reach the server',
    fadetime: 500
  });
  Config.jQuery($);
  RailsApp = Config.RailsApp;
  Design = design;
  underscore = _;

  var changeSlider = function(amount, slider, path) {
    path = path || ""; // optional argument
    var str = amount.toString();
    if (str.length == 2) {
      str = "0"+str;
    }
    else if (str.length == 1) {
      str = "00"+str;
    }   
    var first = str.charAt(0);
    var second = str.charAt(1);
    var third = str.charAt(2);
    document.getElementById(slider + "_1").src = "resources/" + path + "1/odometer-1-"+first+".png";
    document.getElementById(slider + "_2").src = "resources/" + path + "2/odometer-2-"+second+".png";
    document.getElementById(slider + "_3").src = "resources/" + path + "3/odometer-3-"+third+".png";
  };

  var AdminPage = Backbone.View.extend({
    el: '.page',
    render: function () {
      $(this.el).html(adminPageTemplate);
      
      $(function() {
        $.getJSON(RailsApp + '/visitors.json', function(visitors) {
          var v = _.groupBy(visitors, function(vis) {return (vis.sign_out ? "o" : "i");});
          v.i = v.i || []; // if undefined, set to empty array
          v.o = v.o || [];
          changeSlider(visitors.length, "in");
          changeSlider(v.o.length, "out");
          changeSlider(v.i.length, "current", "red_buttons/");
        });
        
        $('.savestatus').hide();
        $('#password_gate').hide();
        $('.simplemodal-close').click(function() {
          $('body').scrollTop(0);
        });
        $('.page').addClass('noscroll');
        $('#done').click(function(e) {
          e.preventDefault();
          $('.page').removeClass('noscroll');
       /* $('#osx-container').on('webkitTransitionEnd', function() {
            setTimeout(function() {
              window.location = $('#done').attr('href');
            }, 350);
          }); */
          $.modal.close();
          window.location = this.href;
          return false;
        });

        BasicReady($);
        PhotosReady();
        SettingsReady();
        Design.engage('admin');
      });
    }
  });
  return AdminPage;
});

function searchGuests(evt) {
  function tagmap(contents, r) {
    r = r || ['tr', 'td'];
    return '<'+r[0]+'>' + _.map(contents, function(c) {
      return '<'+r[1]+'>' + c + '</'+r[1]+'>';
    }).join('') + '</'+r[0]+'>';
  }
  
  evt.preventDefault();
  // serialize the form data, transform into object literal
  var form = {year_from: '', year_to: '', field_options: '', query: ''};
  _.each($(evt.target).serializeArray(), function(e) { form[e.name] = e.value; });
  
  // request results, continue filtering by optional parameter
  $.getJSON(RailsApp +'/search.json', form, function(data) {
    // set up column headings based on form data
    var cols = ['Name', 'Sign In', 'Sign Out'], row;
    if( form.field_options.indexOf('name') === -1 )
      cols.push( form.field_options.replace('_',' ') );
    // actual HTML generation
    var resultHtml = "<table>"
      + tagmap(cols, ['thead', 'th']) +
      _.map(data, function(u) {
        row = [u.first_name + ' ' + u.last_name, u.sign_in, u.sign_out];
        if( form.field_options.indexOf('name') === -1
         && u.hasOwnProperty(form.field_options) )
          row.push(u[form.field_options]);
        return tagmap(row);
      }).join('') + "</table>";
    // plugged in
    $("#searchResults").html(resultHtml);
    $("#osx-container").css('height','');
  });
  return false;
}

function saveDesign(evt) {
  evt.preventDefault();
  // show loading animation on submit button  
  var $submit = $('#osx-modal-content-design input[type=submit]')
    , oldBackground = $submit.css('background')
  $submit.css('background', 'url(/resources/loading.gif) 13px 48% no-repeat, ' + oldBackground);
  // munge the data into the correct format
  var excluded = ['photoseries'];
  var dataArr  = $(evt.target).serializeArray(), data = {};
  var series   = $('#use_photoseries').val();
  underscore.each(dataArr, function(d) {
    if( excluded.indexOf(d.name) >= 0 )
      return;
    else if( d.name === 'series_photos_attributes' )
      data[d.name] = underscore.map(d.value.split(','), function(u) {
        var p = {
          photo_url:  u,
          series_tag: series
        };
        if( u[0] === '-' ) {
          p['photo_url'] = p.photo_url.substr(1);
          p['_destroy']  = true;
        }
        return p;
      });
    else
      data[d.name] = d.value;
  });
  data = {design: data};
  // save the settings
  $.post(RailsApp + '/design.json', data, function(d) {
    data.series_photos = {};
    data.series_photos[series] = [];
    data.photoseries = series;
    underscore.each(data.design.series_photos_attributes, function(p) {
      if( p['_destroy'] ) return;
      data.series_photos[series].push({
        url: p['photo_url']
      });
    });
    Design.reload(data);
    $('body').animate({scrollTop: 0}, function() {
      $submit.css('background', oldBackground);
      $.modal.close();
    });
  }).error(function() {
    var $status = $('#osx-modal-content-design .savestatus');
    $submit.css('background', 'url(/resources/error.png) 13px 48% no-repeat, ' + oldBackground);
    $status.find('span').text('Your design options failed to save.');
    $status.show();
    setTimeout(function() {
      $submit.css('background', oldBackground);
      $status.delay(3000).hide();
    }, 750);
  });
  return false;
}

// Everything Photo Series / Slideshow related
function PhotosReady() {
  function restoreDesign(data) {
    DesignSettings = data;
    setupPhotoSwitch(data);
    for(var key in data.design) {
      var val = data.design[key]
        , atr = '[name='+ key +']'
        , $el = $('input'+atr);
      if( val === null || (typeof val === "string"
        && val.replace(' ','').length === 0) )
        continue; // skip if invalid value
      if( $el.length === 0 ) {
        $el = $('select'+atr);
        if( $el.length === 0 )
          $el = $('textarea'+atr);
          if( $el.length === 0 )
            continue; // skip if not found
      }
      if( $el.attr('type') === 'checkbox' )
        $el.get(0).checked = val;
      else
        $el.val(val);
    }
  }
  
  $.ajax(RailsApp + '/design.json', {
    crossDomain: true,
    dataType: 'jsonp',
    success: restoreDesign
  });

  // photoseries NAVIGATION
  function navDir(isLeft) {
    return function(e) {
      var $div   = $('.photoset > div')
        , scroll = $div.scrollLeft();
      $div.scrollLeft(1000000);
      var max = $div.scrollLeft();
      $div.scrollLeft(scroll);
      if( scroll < 320 && isLeft )
        $div.animate({scrollLeft: 0});
      else if( max - scroll > 320 )
        $div.animate({scrollLeft: scroll + (isLeft ? -1 : 1) * 320});
      else
        $div.animate({scrollLeft: max});
    }
  }
  $('.photoset > .navleft').click(navDir(true));
  $('.photoset > .navright').click(navDir(false));
  
  // photoseries photo PREVIEW or REMOVE
  function photoClick() {
    function previewCallback(e) {
      // lightbox preview
      var attrs = {
        height: $(this).attr('height'),
        width:  $(this).attr('width')
      };
      console.log('preview not implemented!', attrs);
    }

    function removeCallback(e) {
      var url  = $(this).attr('src')
        , list = $('#photo_list').val().split(',');
      list.splice(list.indexOf(url),1);
      list.push('-' + url);
      $('#photo_list').val(list.join(','));
      $(this).remove();
    }

    var toggle = (function() {
      // toggle closure/function members
      var PREVIEW = true, REMOVE = false;
      var ClickMode = PREVIEW;
      ClickCallback = previewCallback;
      return function() {
        // actual toggle function
        if( ClickMode === PREVIEW )
          ClickCallback = removeCallback;
        else
          ClickCallback = previewCallback;
        ClickMode = !ClickMode;
        $(this).toggleClass('pushed');
      }
    })();

    return {
      toggle:   toggle,
      callback: function() {
        ClickCallback.apply(this, arguments);
      }
    };
  }

  var PhotoHandler = photoClick();
  $('#remove_photo').click(PhotoHandler.toggle);
  
  // photoseries population
  function setupPhotoSwitch(data) {
    var PhotoSets = {}, CurrSeries;
    underscore.each(underscore.keys(data.series_photos), function(k) {
      PhotoSets[k] = [];
      var title = (k.length >= 2 ? k[0].toUpperCase() + k.slice(1) : k); // capitalize title
      $('<option>').attr('value', k.toLowerCase()).text(title).appendTo('#use_photoseries');
      underscore.each(data.series_photos[k], function(photo) {
        PhotoSets[k].push($('<img/>').attr('src', photo.url));
      });
    });
    
    function setSeries(series) {
      if( underscore.keys(PhotoSets).indexOf(series) < 0 ) {
        if( series !== CurrSeries )
          $('.photoset > div').empty();
        return;
      }
      var $container = $('.photoset > div'), urls = [];
      $container.empty();
      $(PhotoSets[series]).each(function(p) {
        var $this = PhotoSets[series][p];
        urls.push($this.attr('src'));
        $this.click(PhotoHandler.callback);
        $this.appendTo($container);
      });
      $('#photo_list').val(urls.join(','));
      $('#use_photoseries').val(series);
      CurrSeries = series;
    }
    
    setSeries(data.photoseries);
    $('#use_photoseries').change(function(e) {
      setSeries($(this).val());
    });
  }
  
  // photoseries ADD NEW SERIES ([+] Button)
  $('#add_series').click(function(e) {
    var series = prompt("Enter a single-word title for this series.");
    series = series.replace(' ','');
    if( series === null || series.length === 0 )
      return;
    var opts = $('#use_photoseries > option');
    for(var o in opts) {
      if(opts[o].value === series || opts[o].text === series) {
        $('#use_photoseries').val(opts[o].value);
        return;
      }
    }
    // capitalize just the first letter
    var cap = series.toLowerCase();
    cap = cap[0].toUpperCase() + cap.slice(1);
    $('<option>').attr('value', series.toLowerCase()).text(cap).appendTo('#use_photoseries');
  });
  
  // photoseries URL input
  (function() {
    var $button = $('.designForm .popin input[type=button]')
      , $input  = $('.designForm .popin input[type=text]')
      , $addBtn = $('#update_photoseries')
      , $popin  = $('.designForm .popin');
    
    function addPhoto(e) {
      var url  = $input.val()
        , list = $('#photo_list').val().split(',');
      // add to list
      if( url.replace(' ','') !== "" ) {
        list.push(url);
        $('#photo_list').val(list.join(','));
        var $img = $('<img/>').attr('src', url);
        $img.click(PhotoHandler.callback);
        $img.appendTo('.photoset > div');
      }
      // cleanup    
      $popin.hide();
      $addBtn.removeClass('pushed');
      $input.val("");
    }
    
    $popin.hide();
    $addBtn.click(function() {
      $(this).toggleClass('pushed');
      $popin.toggle();
    });
    $button.click(addPhoto);
    $input.keypress(function(e) {
      if( e.which !== 13 ) return;
      e.preventDefault();
      addPhoto(e);
      return false;
    });
  })();
}

/* Begin settings code */
function SettingsReady() {
  var $lastCustom = $('.custom_fieldset');
  function makeNextCustom(value, checked) {
    // update existing 
    value   = value   || '';
    checked = checked || false;
    if( value !== '' && checked )
      $lastCustom.find('input[type=checkbox]').get(0).checked = checked;
    $lastCustom.find('input[type=text]').val(value);
    $lastCustom.removeClass('endless');
    var $c = $lastCustom.clone()
      , n  = parseInt($lastCustom.find('input[type=text]')
        .attr('id').replace('field_custom_field','')) + 1;
    $c.addClass('endless');
    $c.find('label')
      .attr('for', 'field_custom_field' + n)
      .text('Custom Field ' + n);
    $c.find('input[type=checkbox]')
      .attr('id', 'field_custom_enable' + n)
      .attr('name', 'custom_enable' + n)
      .change(chkChange).get(0).checked = false;
    $c.find('input[type=text]')
      .attr('id', 'field_custom_field' + n)
      .attr('name', 'custom_field' + n)
      .focus(check(true)).blur(check(false)).val('');
    $lastCustom = $c.insertAfter($lastCustom);
    $('#osx-container').css('height', '');
    return $c;
  }
 
  function restoreSettings(data) {
    FormSettings = data;
    _.each(_.keys(data), function(key) {
      var $el;
      if( data[key] === null ) return;
      if( key.indexOf('custom') < 0 ) {
        // standard fields
        $el = $('#signinsetup select[name='+ key +']');
        if( $el.length === 0 ) return;
        $el.val(data[key]);
      } else {
        // custom fields
        _.each(_.values(data[key]), function(field) {
          $el = makeNextCustom(field.label, true);
        });
      }
    });
  }
  
  // JSONP call for settings
  if( FormSettings === false ) {
    $.ajax(RailsApp + '/settings/getSettings.json', {
      crossDomain: true,
      dataType: 'jsonp',
      success: restoreSettings
    });
  } else
    restoreSettings(FormSettings);
  
  // make custom field checkboxes and input fields tied together
  // uncheck    -> clear input
  // enter data -> check box
  // clear data -> clear check box
  function check(b) {
    // b: focus/blur (true/false)
    return function(e) {
      if( b || (!b && $(this).val() === "") )
        document.getElementById(this.id.replace('_field', '_enable')).checked = b;
      if( b && this.id.indexOf('custom') >= 0
        && $(this).parent().hasClass('endless') )
        makeNextCustom();
    }
  }
  function chkChange(e) {
    var $in = $("#" + this.id.replace('_enable','_field'));
    if( !this.checked )
      $in.val("");
    else
      $in.focus();
  }
  $('#signinsetup input[type=text]').focus(check(true)).blur(check(false));
  $('#signinsetup input[type=checkbox]').change(chkChange);
}

function saveSettings(evt) {
  evt.preventDefault();
  var $submit = $('#osx-modal-content-setup input[type=submit]')
    , oldBackground = $submit.css('background')
  $submit.css('background', 'url(/resources/loading.gif) 13px 48% no-repeat, ' + oldBackground);
  
  var dataMap = $(evt.target).serializeArray()
    , enabled_custom = []
    , data = {custom_fields_attributes: []};
  // determine which custom fields are enabled
  underscore.each(dataMap, function(f) {
    if( f.name.indexOf('custom_enable') < 0 ) return;
    var n = parseInt(f.name.replace('custom_enable',''));
    enabled_custom.push('custom_field' + n);
  });
  // populate data object, filtering out disabled custom fields
  underscore.each(dataMap, function(f) {
    if( f.name.indexOf('custom_enable') >= 0 )
      return;
    if( f.name.indexOf('custom_field') >= 0 ) {
      if( enabled_custom.indexOf(f.name) >= 0 )
        data.custom_fields_attributes.push({label: f.value});
      return;
    }
    data[f.name] = f.value;
  });
  // save the settings
  $.post(RailsApp + '/settings.json', data, function(d) {
    $('body').animate({scrollTop: 0}, function() {
      $submit.css('background', oldBackground);
      $.modal.close();
    });
  }).error(function() {
    var $status = $('#osx-modal-content-setup .savestatus');
    $status.find('span').text('Your settings failed to save.');
    $status.show();
    $submit.css('background', 'url(/resources/error.png) 13px 48% no-repeat, ' + oldBackground);
    setTimeout(function() {
      $submit.css('background', oldBackground);
      $status.delay(3000).hide();
    }, 750);
  });
  return false;
}
