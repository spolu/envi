/******************************/
/*   CLI CELL                 */
/******************************/
var cli_c = function(spec, my) {
  var _super = {};
  my = my || {};

  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private


  var that = CELL.cell(spec, my);

  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').attr('id', 'envi-cli').addClass('envi-cli')
                            .html('-- INSERT --');

    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { display: '' }
   */
  refresh = function(json) {

    _super.refresh(json);
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
