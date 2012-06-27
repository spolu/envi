/******************************/
/*   TILE CELL                */
/******************************/
var tile_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.id = spec.id;

  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private

  var that = CELL.cell(spec, my);

  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').addClass('envi-tile');

    my.children['ace'] = ace_c({ path: my.path + '/ace',
                                 container: my.container,
                                 tile: my.id });
    my.element.append(my.children['ace'].build());
    /*
    my.children['status'] = status_c({ path: my.path + '/status',
                                       container: my.container,
                                       tile: my.id });
    my.element.append(my.children['status'].build());
    */

    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { left, top, width, height,
   *            focus: true|false }
   */
  refresh = function(json) {
    my.element.css({ left: json.left,
                     top: json.top,
                     width: json.width,
                     height: json.height });
    if(json.focus)
      my.element.addClass('focus');
    else
      my.element.removeClass('focus');

    _super.refresh({ ace: '' });
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
