define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/current/page.html'
], function($, _, Backbone, currentPageTemplate){
  var CurrentPage = Backbone.View.extend({
    el: '.page',
    render: function () {
      this.$el.html(currentPageTemplate);
      
function changetext()
	{
	var pagetype = localStorage.getItem("pageType");
	if (pagetype == 2) {
      	document.getElementById('title').innerHTML ='Guests Currently On Premesis';
    }
    
    if (pagetype == 3)
	{
      document.getElementById('title').innerHTML ='Out';
    }
    if (pagetype == 1)
	{
     document.getElementById('title').innerHTML ='In';
    }

    
    }
        changetext();
    }
  });
  return CurrentPage;
});