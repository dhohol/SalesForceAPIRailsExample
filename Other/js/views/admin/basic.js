/*
 * SimpleModal Basic Modal Dialog
 * http://www.ericmmartin.com/projects/simplemodal/
 * http://code.google.com/p/simplemodal/
 *
 * Copyright (c) 2010 Eric Martin - http://ericmmartin.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Revision: $Id: basic.js 254 2010-07-23 05:14:44Z emartin24 $
 */
define(['simplemodal'], function() {
  var formcontents = {};

  return function($) {
    var content;
  	$('#basic-modal .buttonbasic').click(function (e) {
  		$('#basic-modal-content').modal({
    		minHeight: 850,
    		maxHeight:599,
    		overlayClose: true
  		});
  		return false;
  	});
    
  	var OSX = {
  		container: null,
  		init: function () {
  			$(".buttonsetuposx").click(function (e) {
  				e.preventDefault();
  				$.modal.close();
  				content = "#osx-modal-content-setup";
  				$(content).modal({
  					overlayId: 'osx-overlay',
  					containerId: 'osx-container',
  					closeHTML: null,
  					minHeight: 80,
  					maxHeight:599,
  					opacity: 65, 
  					position: ['60px',],
  					overlayClose: true,
  					onOpen: OSX.open,
  					onClose: OSX.close,
  					onShow: OSX.fixup
  				});
  
  			});
  			
  			$(".buttondesignosx,").click(function (e) {
  				e.preventDefault();
  				$.modal.close();
  				content = "#osx-modal-content-design";
  				$(content).modal({
  					overlayId: 'osx-overlay',
  					containerId: 'osx-container',
  					closeHTML: null,
  					minHeight: 80,
  					maxHeight:599,
  					opacity: 65, 
  					position: ['60px',],
  					overlayClose: true,
  					onOpen: OSX.open,
  					onClose: OSX.close,
  					onShow: OSX.fixup
  				});
  			});

  			$(".buttonsearchosx,").click(function (e) {
  				e.preventDefault();
  				$.modal.close();
  				content = "#osx-modal-content-search";
  				$(content).modal({
  					overlayId: 'osx-overlay',
  					containerId: 'osx-container',
  					closeHTML: null,
  					minHeight: 80,
  					maxHeight:599,
  					opacity: 65, 
  					position: ['60px',],
  					overlayClose: true,
  					onOpen: OSX.open,
  					onClose: OSX.close,
            onShow: OSX.fixup
  				});	
  			});
  		},
  		
  		open: function (d) {
  			var self = this;
  			// restore form contents
  			var form = d.container.find('form')
  			  , fid  = form.attr('id');
  			if( fid && fid !== '' && formcontents.hasOwnProperty(fid) ) {
  			  var data = formcontents[fid];
  			  for( var i = 0, n = data.length; i < n; i++ ) {
  			    var $in = form.find('[name='+data[i].name+']');
  			    if( $in.length > 0 ) $in.val(data[i].value);
  			  }
  			}

  			self.container = d.container[0];
  			$(content, self.container).show();
        $("#osx-modal-title", self.container).show();
  		  $("#osx-modal-data", self.container).show();
        $(".close", self.container).show();
     /* var min = d.container.height(); */
  		  d.container.height('auto');
  	 /* var max = d.container.height();
  		  d.container.height(min);
  	    var $imgs = d.container.find('.photoset img').hide();
  		  setTimeout(function() {
  		    d.container.slideDown('fast', 'linear', function() {
            d.container.on('webkitTransitionEnd', function() {
              d.container.css('-webkit-transition', 'none');
              d.container.off('webkitTransitionEnd');
              $imgs.show();
            }).css('-webkit-transition', 'height 1s linear');
            setTimeout(function() {
              d.container.height(max);
            });
          });
  		  }); */

        d.container.show();
  		},
  		
  		close: function (d) {
  		  var self = this;
        // save form contents
  		  var form = d.container.find('form');
  		  if( form.length > 0 )
  		    formcontents[form.attr('id')] = form.serializeArray();
     /* var $imgs = d.container.find('.photoset img').hide();
  		  d.container.on('webkitTransitionEnd', function() {
  		    d.container.css('-webkit-transition', 'none');
  		    d.container.off('webkitTransitionEnd');
          d.container.slideUp('fast', 'linear', function() {
            $imgs.show();
            self.close();
          });
  		  }).css('-webkit-transition', 'height 1s linear');
  		  setTimeout(function() {
  		    d.container.height(60);
  		  }); */
  		  d.container.hide();
  		  self.close();
  		},
  		
  		fixup: function(d) {
  		  d.container.css({
  		    position: 'absolute'
  		  });
  		}
  	};
  
  	OSX.init();
  };
});