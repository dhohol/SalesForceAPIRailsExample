describe("Admin options", function() {
  function markFields(as) {
    return function() {
      waitsFor(function() {
        return $('#setup').length > 0;
      });
  
      runs(function() {
        $('#setup').click();
        var contEl;
        waitsFor(function() {
          contEl = document.getElementById('osx-container');
          return contEl !== null;
        });
    
        runs(function() {
          waitsFor(function() {
            return contEl.style['-webkit-transition'] === 'none';
          });
          
          runs(function() {
            $('#field_firstName').val(as);
            $('#prepareButton').click();

            var required = (as === 1);
            waitsFor(function() {
              if( $('#osx-container').length === 0 ) {
                if( window.location.hash !== '#/signIn' )
                  window.location.hash = '#/signIn';
                else
                  return ($('#first_name_div').hasClass('required') && required) || !required;
              }
              return false;
            }, 'first name not marked required');
          });
        });
      });
    };
  }

  beforeEach(function() {
    window.location = '#/admin';
  });

  afterEach(function() {
    window.location.hash = '';
  });

  it("should mark fields required", markFields(1));
  it("should hide fields", markFields(-1));
});
