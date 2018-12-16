/* Plugin created by Sankarsh Vittal */

(function ( $ ) {

// used to change the font size
$.fn.font = function(size) {
  return $("body")
  .css("font-size", size);
};

// used to change the background color
$.fn.backColor = function(color) {
return $("body").css( "background-color", color );
};

//used to check for errors from the data recieved by the ajax call
$.fn.checkErrors = function(data) {
if ($(data).find("error").length !== 0){
return true;
}
else{
  return false;
}};

})(jQuery);
