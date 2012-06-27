/******************************/
/*   STATUS CELL              */
/******************************/
var status_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.pos = { row: 0, col: 0 };
  my.file = 'scratch';
  
  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private


  var that = CELL.cell(spec, my);

  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').addClass('envi-status');
    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { row: 23,
   *            col: 2,
   *            file: '' }
   */
  refresh = function(json) {
    if(typeof json.row !== 'undefined')
      my.pos.row = json.row;
    if(typeof json.col !== 'undefined')
      my.pos.col = json.col;
    if(typeof json.file !== 'undefined')
      my.file = json.file;

    var disp = '&nbsp;%&nbsp ';
    disp += my.file.substr(0, 32);
    disp += '&nbsp;&nbsp;l' + my.pos.row + ':' + my.pos.col;
    
    my.element.html(disp);
    _super.refresh(json);
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};

