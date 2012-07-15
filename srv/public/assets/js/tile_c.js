/******************************/
/*   TILE CELL                */
/******************************/
var tile_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.id = spec.id;
  
  my.path = undefined;
  my.dirty = false;

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

    console.log(my.path);
    _super.refresh({ editor: { focus: json.focus},
                     status: {} });
  };


  /**
   * warns the user through the status bar
   * @param msg the warn message
   */
  warn = function(msg) {
    my.children['status'].warn(msg);
  };

  /**
   * attempt to close the tile. The tile will be closed if the editor
   * accepts it (no outstanding changes or the force argument is set)
   * @param force force close
   */
  close = function(force) {
    if(my.dirty && !force) {
      my.children['status'].warn('No write since last change');
    }
    else {
      that.emit('destroy', my.id);
    }
  };
  

  /**
   * opens a file by retrieving its content from the server and pushing
   * it to the editor. It also updates the status bar
   * @param p the file path to open
   */
  open = function(p) {
    $.get('/file?path=' + p)
      .success(function(buf) {
        my.children['editor'].ace().session.setValue(buf);
        my.dirty = false;
        my.path = p;
      });
  };

  /**
   * saves the file and remove its dirtiness. It also updates the status
   * bar to show that the file is not dirty anymore
   */
  save = function() {
    console.log('SAVE: ' + my.path);
    console.log(my.children['editor'].ace().session.getValue());
    if(typeof my.path !== undefined) {
      $.ajax({ url: '/file?path=' + my.path,
               data: my.children['editor'].ace().session.getValue(),
               type: 'PUT' })
        .success(function() {
          console.log('DONE');
          my.dirty = false;
        });
    }
    else {
      my.children['status'].warn('No file');
    }
  };


  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  CELL.method(that, 'close', close, _super);
  CELL.method(that, 'open', open, _super);
  CELL.method(that, 'save', save, _super);

  return that;
};
