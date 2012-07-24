define(['loading'], function(Loading) {
  var load = Loading({
    waittime:  2500,
    container: '#loading',
    message:   '#loading .message',
    timeout:   'Unable to scan QR code,<br/>the action timed out.'
  });
  
  function qrInit(qr, bb, selector) {
    if( qr === false || bb === false
      || typeof selector !== "string"
      || selector === "" ) {
      $(selector).click(function(e) {
        e.preventDefault();
        load.start();
        console.warn = console.warn || console.log; // incase .warn isn't supported
        console.warn('Warning: BB WebWorks API not available.');
        return false;
      });
      return false;
    }
    var QR = qr, BB = bb;
    function qrResult(data) {
      function home() {
        if( window.location.hash !== '' ) {
          window.location.hash = '#';
        }
      }
      $.get(RailsApp + "/visitors/signIn.json", {data: data}, function(){
        load.end("Signed In Successfully", home);
      }).error(function() {
        load.end("Sign In Failed", home);
      });
    }
    
    function canvasEncode(filePath, callback) {
      var canvas = document.getElementById('qr-canvas')
        , scaling = 1/8
        , ctx = canvas.getContext('2d')
        , img = new Image();
      img.onload = function() {
        canvas.width  = img.width  * scaling;
        canvas.height = img.height * scaling;
        ctx.drawImage(img, 0, 0, img.width * scaling, img.height * scaling);
        callback();
      };
      img.src = filePath;
    }
    
    function scanQR(e){
      e.preventDefault();
      load.start();
      QR.callback = qrResult;
      // I'm not sure if our camera_dispatcher fix causes this method to block
      // due to swapping MakeAsyncCall with MakeSyncCall. setTimeout to be safe
      setTimeout(function() {
        BB.media.camera.takePicture(function(filePath) {
          // success, picture taken
          load.wait();
          canvasEncode(filePath, function() {
            QR.decode();
          });
        }, function() {
          // camera closed, start waiting for timeout
          load.wait();
        }, function(e) {
          // camera error, let the user know
          load.end("There was a problem with the camera." +
                   "<br/>Please, try again.<br/>["+ e +"]");
        });
      });
      return false;
    }
    
    // qr badge scanning link
    $(selector).click(scanQR);
    return true;
  }
  
  return qrInit;
});
