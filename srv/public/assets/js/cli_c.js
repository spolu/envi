/******************************/
/*   CLI CELL                 */
/******************************/
var cli_c = function(spec, my) {
  var _super = {};
  my = my || {};

  my.suggest = { cur: '',
                 pos: 0,
                 files: [] };

  // public
  var build;   /* build(); */
  var refresh; /* refresh(); */

  // private
  var autocomplete;  /* autocomplete() */

  var that = CELL.cell(spec, my);

  /****************************/
  /*   BUILD                  */
  /****************************/
  build = function() {
    my.element = $('<div/>').attr('id', 'envi-cli').addClass('envi-cli');
    my.element.append($('<div/>').addClass('display'));
    my.element.append($('<textarea wrap="off" rows="1"/>'));
    my.element.append($('<div/>').addClass('suggestion'));

    my.element.keydown(function(evt) {
      var captured = false;
      switch(evt.keyCode) {
        case 27:
          that.emit('cancel');
          captured = true;
        break;
        case 13:
          that.emit('done', $('#envi-cli textarea').val());
          captured = true;
        break;
        case 9:
          autocomplete();
          captured = true;
        break;
      }
      if(captured)
        return false;
    });

    return my.element;
  };

  /****************************/
  /*   REFRESH                */
  /****************************/
  /**
   * @expects { active: true|false,
   *            str: '' }
   */
  refresh = function(json) {
    if(!json.active) {
      $('#envi-cli .display').html(json.str);
      $('#envi-cli div.display').addClass('active');
      $('#envi-cli textarea').removeClass('active');
      $('#envi-cli .suggestion').removeClass('active');
    }
    else {
      $('#envi-cli textarea').val(json.str);
      $('#envi-cli .display').removeClass('active');
      $('#envi-cli textarea').addClass('active');
      $('#envi-cli .suggestion').addClass('active');
      $('#envi-cli .suggestion').html('');
      
      setTimeout(function() {
        $('#envi-cli textarea').focus();
        $('#envi-cli textarea').get(0).setSelectionRange(1,1);
      }, 50);
    }

    _super.refresh(json);
  };

  /**
   * Auto compeletes the last string of the cli according to its
   * position. For now only 2nd position autocomplete works with
   * path arguments
   */
  autocomplete = function() {
    var cur = $('#envi-cli textarea').val();

    var suggest = function() {
      my.suggest.pos = my.suggest.pos % my.suggest.files.length;
      $('#envi-cli .suggestion').html(my.suggest.files[my.suggest.pos] || '');
    };

    if(my.suggest.cur !== cur) {
      my.suggest.cur = cur;
      my.suggest.pos = 0;
      my.suggest.files = [];
    
      if(cur[0] !== ':')
        return;
      var cmp = cur.split(' ');
      var cmd = cmp.shift();

      $.get('/autocomplete?path=' + cmp.join(' '))
        .success(function(data) {
          console.log(data);
          if(data.ok && data.paths.length === 1) {
            $('#envi-cli textarea').val(cmd + ' ' + data.paths[0]);
            $('#envi-cli .suggestion').html('');
          }
          else {
            my.suggest.files = [];
            data.paths.forEach(function(p) {
              var f = p.split('/').pop();
              my.suggest.files.push(f);
            });
            suggest();
          }
        });
    }
    else {
      my.suggest.pos++;
      suggest();
    }
  };
  
  CELL.method(that, 'build', build, _super);
  CELL.method(that, 'refresh', refresh, _super);

  return that;
};
