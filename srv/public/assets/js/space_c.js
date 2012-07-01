/******************************/
/*   SPACE CELL               */
/******************************/
var space_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.tiles = {};

  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private
  var tile;    /* tile(id); */

  var that = CELL.cell(spec, my);

  /**
   * Retrieves an tile by id from the local object cache or
   * construct it if not found
   * @param id the tile unique (incremental) id
   */
  tile = function(id) {
    if(!my.tiles[id]) {
      my.tiles[id] = tile_c({ path: my.path + '/' + id,
                              container: my.container,
                              id: id });
      my.children[id] = my.tiles[id];
      my.tiles[id].on('destroy', function() {
        delete my.tiles[id];
        delete my.children[id];
      });
      my.tiles[id].build();
    }
    return my.tiles[id];
  };

  
  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').addClass('envi-space');
    return my.element;
  };


  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { tiles: ['t4', 't2', 't0'], 
   *            focus: 't0' }
   */
  refresh = function(json) {
    my.element.empty();

    var len = json.tiles.length;
    var step = len > 0 ? (100 / (len - 1)) : 0;
    
    json.tiles.forEach(function(id, i) {
      var t = tile(id);
      my.element.append(t.element());
      if(i === 0 && len === 1) {
        t.refresh({ left: '0px', 
                    top: '0px',
                    width: '100%', 
                    height: '100%',
                    focus: (json.focus === i && !json.cli) });
      }
      else if(i === 0) {
        t.refresh({ left: '0px', 
                    top: '0px',
                    width: '50%', 
                    height: '100%',
                    focus: (json.focus === i && !json.cli) });
      }
      else {
        t.refresh({ left: '50%', 
                    top: (step * (i-1)) + '%',
                    width: '50%', 
                    height: step + '%',
                    focus: (json.focus === i && !json.cli) });
      }
    });

    _super.refresh(json);
  };
  

  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
