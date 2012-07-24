describe("Quick email form", function() {
  beforeEach(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();
    var requests = this.requests = [];
    this.xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };

    $('input.quickUse').val('spec@test.com');
  });

  afterEach(function() {
    this.xhr.restore();
  });

  it("should login a returning visitor", function() {
    $('.login.button.signin').click();
    expect(this.requests.length).toEqual(1);

    this.requests[0].respond(200, {"Content-Type": "application/json"}, '{"success": true}');
    expect($('input.quickUse').val()).toEqual('');
    expect(window.location.hash).toEqual('');
  });

  it("should send new visitors to the SignIn page", function() {
    $('.login.button.signin').click();
    expect(this.requests.length).toEqual(1);

    this.requests[0].respond(400, {"Content-Type": "application/json"}, '{"success": false}');
    expect(window.location.hash).toEqual('#/signIn');

    waitsFor(function() {
      var $email = $('#email_div input[name=email]');
      if( $email.length > 0 )
        return $email.val() !== '';
      else return false;
    });

    runs(function() {
      expect($('#email_div input[name=email]').val()).toEqual('spec@test.com');
      window.location.hash = '';
      waitsFor(function() {
        return $('input.quickUse').length > 0;
      });
      runs(function() {
        expect($('input.quickUse').val()).toEqual('');
      });
    });
  });

  it("should sign out existing visitors", function() {
    $('.login.button.signout').click();
    expect(this.requests.length).toEqual(1);

    this.requests[0].respond(200, {"Content-Type": "application/json"}, '[]');
    expect(window.location.hash).toEqual('');
    expect($('input.quickUse').val()).toEqual('');
  });

  it("should send unknown visitors to the SignOut page", function() {
    $('.login.button.signout').click();
    expect(this.requests.length).toEqual(1);

    this.requests[0].respond(400, {"Content-Type": "application/json"}, '[]');
    expect(window.location.hash).toEqual('#/signOut');
    window.location.hash = '';
    expect($('input.quickUse').val()).toEqual('');
  });
});
