/******************************/
/*   EDITOR CELL              */
/******************************/
var editor_c = function(spec, my) {
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
    my.element = $('<div/>').addClass('envi-editor').attr('id', my.tile + '-editor'); 
    // test
    //my.element.html('test here a,.,.a ,., a,., ,.,a aasa s s\nvar it = function() {\n}\n\n\n\nok\n\n,\n\nhophon');

    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { focus: true|false }
   */
  refresh = function(json) {
    if(!my.ace) {
      my.ace = ace.edit(my.tile + '-editor');
      my.ace.envi_tile = my.tile;
      my.ace.session.setFoldStyle('manual');
      my.ace.setShowFoldWidgets(false);
      my.ace.setKeyboardHandler(require("ace/keyboard/envi").handler({}));
      my.ace.setTheme("ace/theme/envi");
      //my.ace.setShowInvisibles(true);
      
      my.ace.on('focus', function() {
        that.emit('focus', my.tile);
      });
      my.ace.on('blur', function() {
        console.log('BLUR: ' + my.tile);
      });
      my.ace.on('envi-key', function(key) {
        that.emit('key', key);
      });
      my.ace.on('envi-cmd', function() {
        that.emit('cli', ':');
      });
      my.ace.on('envi-find', function() {
        that.emit('cli', '/');
      });
      my.ace.getSession().selection.on('changeCursor', function() {
        that.emit('cursor', my.ace.selection.getCursor());
      });
    }

    if(json.focus) {
      my.ace.focus();
    }
    else {
      my.ace.blur();
    }
    my.ace.resize();

    _super.refresh(json);
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  CELL.getter(that, 'ace', my, 'ace');

  return that;
};
