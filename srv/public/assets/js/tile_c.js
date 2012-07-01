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

    my.children['editor'] = editor_c({ path: my.path + '/editor',
                                       container: my.container,
                                       tile: my.id });
    my.element.append(my.children['editor'].build());

    my.children['status'] = status_c({ path: my.path + '/status',
                                       container: my.container,
                                       tile: my.id });
    my.element.append(my.children['status'].build());

    my.children['editor'].on('cursor', function(pos) {
      my.children['status'].refresh({ row: pos.row,
                                      col: pos.column });
    });

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

    _super.refresh({ editor: { focus: json.focus},
                     status: {} });
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
