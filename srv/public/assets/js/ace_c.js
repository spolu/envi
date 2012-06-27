/******************************/
/*   ACE CELL                 */
/******************************/
var ace_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.tile = spec.tile;

  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private

  var that = CELL.cell(spec, my);

  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').addClass('envi-ace').attr('id', my.tile + '-ace'); 
    // test
    //my.element.html('test here a,.,.a ,., a,., ,.,a aasa s s\nvar it = function() {\n}\n\n\n\nok\n\n,\n\nhophon');

    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects {}
   */
  refresh = function(json) {
    setTimeout(function() {
      if(!my.ace) {
        my.ace = ace.edit(my.tile + '-ace');
        my.ace.setTheme("ace/theme/envi");
        my.ace.session.setFoldStyle('manual');
        my.ace.setShowFoldWidgets(false);
        my.ace.setKeyboardHandler(require("ace/keyboard/envi").handler);
        //my.ace.setShowInvisibles(true);
      }
    }, 10);
    _super.refresh(json);
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
