define([
  'views/main/page',
  'views/admin/page',
  'views/signIn/page',
  'views/signOut/page'
], function(Main, Admin, SignIn, SignOut) {
  return {
    Main:    Main,
    Admin:   Admin,
    SignIn:  SignIn,
    SignOut: SignOut
  }
});
