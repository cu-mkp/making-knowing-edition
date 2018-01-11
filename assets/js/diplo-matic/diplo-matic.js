
var main = function main() { $( document ).ready(function() {
  // locate the top level div, if it exists, instantiate
  var $mainView = $('.diplo-matic');

  if( $mainView[0] ) {
    var mainView = new MainView($mainView[0].id);
    mainView.render();
  } else {
    console.log('DiploMatic: main view not found, expecting div with class "diplo-matic".');
  }

});
};

main();
