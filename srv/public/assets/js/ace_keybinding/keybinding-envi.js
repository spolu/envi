/**
 * TODO:
 * MOTIONS:
 * --------
 *  - 'vib'
 *  - 'v*'
 *  OPERATORS:
 *  ---------
 *  - 'd' / 'dd'
 *  - 'c' / 'cc'
 *  - 'r'
 *  - 'J'
 *  - 'y' / 'yy'
 *  - 'p'
 *  - 'P'
 *  - 'o'
 *  - 'O'
 *  - 'i'
 *  - 'I'
 *  - 'a'
 *  - 'A'
 *  - 's'
 *  - 'S'
 *  - 'x'
 *  - 'X'
 *  - 'u'
 *  - 'ctrl-r'
 *  - '.'
 *  EVENTS: 
 *  -------
 *  - ':'
 *  - '/'
 *  - 'n'
 *  - 'N'
 *  MODES:
 *  ------
 *  - "replace" mode

/*****************************/
/*   KEYBINDING ENVI         */
/*****************************/
define('ace/keyboard/envi', 
       ['require', 'exports', 'module' , 'ace/lib/keys', 
       'ace/keyboard/envi/normal',
       'ace/keyboard/envi/insert',
       'ace/keyboard/envi/visual',
       'ace/keyboard/envi/visual_line'], 
       function(require, exports, module) {
         "use strict"

         /**
          * The Handler Object
          *
          * Classical Handler Wrapper with the specificity of letting
          * the user specify a set of key that should be emitted on a
          * 'user_key' event
          *
          * @param spec {user_keys}
          */
         exports.handler = function(spec, my) {
           my = my || {};

           my.modes = {};
           my.user_keys = spec.user_keys || [];

           // public
           var attach;            /* attach(editor); */
           var detach;            /* detach(editor); */
           var handleKeyboard;    /* handleKeyboard(data, hashId, key, keyCode, e) */

           var that = {};

           /**
            * Handles all input key received by ace and distribute work to the current
            * mode. Parameters are standard to ace infrastructure.
            * @return an ace command
            */
           handleKeyboard = function(data, hashId, key, keyCode, e) {
             if(hashId !== 0 && (key == "" || key == "\x00"))
               return null;

             if(hashId === 1) key = "ctrl-" + key;

             // user keys
             if(my.user_keys.indexOf(key) !== -1) {
               my.editor._emit('user_key', key);
               e.stopImmediatePropagation();
               return null;
             }

             if(hashId === 1 || hashId === -1 || key === 'esc') {
               return my.modes[data.mode].push(key);
             }
           };

           /**
            * Called when the editor is first attached to this keyboard handler
            * @param editor the ace editor
            */
           attach = function(editor) {
             my.editor = editor;
             console.log('ATTACH: ' + editor.envi_tile);
             my.modes['normalMode']     = require('./envi/normal').normal({ editor: editor });
             my.modes['insertMode']     = require('./envi/insert').insert({ editor: editor });
             my.modes['visualMode']     = require('./envi/visual').visual({ editor: editor });
             my.modes['visualLineMode'] = require('./envi/visual_line').visual_line({ editor: editor });

             my.modes['normalMode'].setNormalMode();
           };

           /**
            * Called when the editor is detached from this keyboard handler
            * @param editor the ace editor
            */
           detach = function(editor) {
             console.log('DETACH: ' + editor.envi_tile);
           };
           
           that.handleKeyboard = handleKeyboard;
           that.attach = attach;
           that.detach = detach;

           return that;
         };

       });


/*****************************/
/*   ENVI MODE BASE          */
/*****************************/
define('ace/keyboard/envi/mode',
       ['require', 'exports', 'module', 'ace/lib/keys'], 
       function(require, exports, module) {
         "use strict"

         /**
          * Envi Mode Base Class
          *
          * Provides helper function as well as base functionality
          * for the envi modes.
          *
          * @param { editor, mode }
          */
         exports.mode = function(spec, my) {
           my = my || {};

           my.editor = spec.editor;
           my.mode = spec.mode;
           my.active = false;
           my.buffer = '';
            
           // public
           var currentMode;       /* currentMode(); */
           var lineMode;          /* lineMode(); */

           var setNormalMode;     /* setNormalMode(); */
           var setInsertMode;     /* setInsertMode(); */
           var setVisualMode;     /* setVisualMode(); */
           var setVisualLineMode; /* setVisualLineMode(); */

           var push;              /* push(key); */


           var that = {};

           /**
            * Listens for `enviChangeMode` events to call attach
            * and detach functions on subclassing mode objects
            */
           my.editor.on('enviChangeMode', function(mode) {
             my.buffer = '';
             if(that.currentMode() !== my.mode) {
               if(my.active) {
                 if(that.detach) that.detach();
                 my.active = false;
                 console.log('detach: ' + my.mode)
               }
             }
             else {
               if(that.attach) that.attach();
               my.active = true;
               console.log('attach: ' + my.mode);
             }
           });


           /**
            * Basic buffer implementation for inert/visual mode.
            * it accumulates characters and call `exec` on itself
            * (the mode) to handle it
            * @param key the key received
            * @param editor the editor
            * @returns the generated editor command
            */
           push = function(key) {
             switch(key) {
               case 'esc': 
                 that.setNormalMode();
                 return { command: "null" };
                 break;
               default:
                 if(that.exec) {
                   my.buffer += key;
                   console.log('[' + my.mode + '] "' + my.buffer + '" ' + my.editor.envi_tile); 
                   return that.exec();
                 }
             }
           };

           /**
            * Returns the current mode
            */
           currentMode = function() {
             return my.editor.keyBinding.$data.mode;
           };


           /**
            * Sets the editor in Normal Mode
            */
           setNormalMode = function() {
             my.editor.keyBinding.$data.mode = 'normalMode';
             my.editor._emit('enviChangeMode', currentMode());
           };

           /**
            * Sets the editor in Insert Mode
            */
           setInsertMode = function() {
             my.editor.keyBinding.$data.mode = 'insertMode';
             my.editor._emit('enviChangeMode', currentMode());
           };

           /**
            * Sets the editor in Visual Mode
            */
           setVisualMode = function(lineMode) {
             my.editor.keyBinding.$data.mode = 'visualMode';
             my.editor._emit('enviChangeMode', currentMode());
           };

           /**
            * Sets the editor in Visual Line Mode
            */
           setVisualLineMode = function(lineMode) {
             my.editor.keyBinding.$data.mode = 'visualLineMode';
             my.editor._emit('enviChangeMode', currentMode());
           };


           that.buffer = function() { return my.buffer; };
           that.currentMode = currentMode;

           that.setNormalMode = setNormalMode;
           that.setInsertMode = setInsertMode;
           that.setVisualMode = setVisualMode;
           that.setVisualLineMode = setVisualLineMode;
           
           that.push = push;

           return that;
         };
       });


/*****************************/
/*   ENVI NORMAL MODE        */
/*****************************/
define('ace/keyboard/envi/normal',
       ['require', 'exports', 'module', 'ace/lib/keys', 
        'ace/keyboard/envi/mode', 'ace/keyboard/envi/motions'],
       function(require, exports, module) {
         "use strict"

         var mode = require('./mode').mode;
         var motions = require('./motions');
         var operators = require('./operators');

         require('../../lib/dom').importCssString('\
           .envi-normal-mode .ace_cursor{\
             border: 0!important;\
             background-color: red;\
             opacity: 0.5;\
           }', 'enviNormalMode');
           

         /**
          * Envi Normal Mode
          *
          * In charge of handling envi normal mode
          * 
          * @param { editor }
          */
         exports.normal = function(spec, my) {
           my = my || {};
 
           // public

           // protected
           var exec;    /* exec(); */
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 

           var that = mode({ editor: spec.editor,
                             mode: 'normalMode' }, my);


           /**
            * Called by the base mode object to process
            * the buffer and return the computed command
            * @returns the generated editor command
            */
           exec = function() {
             // LIST OF NORMAL MODE COMMANDS
             var cmds = { 
               '([0-9]*)(c|d)([0-9]*)(f|F|t|T)(.)$': function(match) {
                 if(match[1].length === 0)
                   match[1] = '1';
                 if(match[3].length === 0)
                   match[3] = '1';
                 if(operators[match[2]]) {
                   var count_op = parseInt(match[1], 10);
                   while(0 < count_op--) {
                     var count_mtn = parseInt(match[3], 10);
                     operators[match[2]](my.editor);
                   }
                   my.buffer = '';
                 }
               },
               '([0-9]*)(c|d)([0-9]*)(h|j|k|l|\\$|\\^|0|e|E|w|W|b|B|ge|gE|G|gg)$': function(match) {
                 console.log('HERE');
                 if(match[1].length === 0)
                   match[1] = '1';
                 if(match[3].length === 0)
                   match[3] = '1';
                 console.log(match[1] + ' ' + match[2]);
                 if(operators[match[2]]) {
                   var count_op = parseInt(match[1], 10);
                   while(0 < count_op--) {
                     operators[match[2]](my.editor);
                   }
                   my.buffer = '';
                 }
               },
               '([0-9]*)(f|F|t|T)(.)$': function(match) {
                 if(match[1].length === 0) 
                   match[1] = '1';
                 if(motions[match[2]]) {
                   var count = parseInt(match[1], 10);
                   while(0 < count--) {
                     var mtn = motions[match[2]](my.editor,
                                                 my.editor.getCursorPosition(), 
                                                 my.editor.getCursorPosition(),
                                                 match[3]); 
                     my.editor.navigateTo(mtn.dst.row, mtn.dst.column);
                   }
                   my.buffer = '';
                 }
               },
               '([0-9]*)(h|j|k|l|\\$|\\^|0|e|E|w|W|b|B|ge|gE|G|gg)$': function(match) {
                 if(match[1].length === 0)
                   match[1] = '1';
                 if(motions[match[2]]) {
                   var count = parseInt(match[1], 10);
                   while(0 < count--) {
                     var mtn = motions[match[2]](my.editor, 
                                                 my.editor.getCursorPosition(), 
                                                 my.editor.getCursorPosition()); 
                     my.editor.navigateTo(mtn.dst.row, mtn.dst.column);
                   }
                   my.buffer = '';
                 }
               },
               'i$': function(match) {
                 that.setInsertMode();
                 my.buffer = '';
               },
               '\:$': function(match) {
                 my.editor._emit('user_cmd');
                 my.buffer = '';
               },
               '\/$': function(match) {
                 my.editor._emit('user_find');
                 my.buffer = '';
               }
             };

             for(var p in cmds) {
               if(cmds.hasOwnProperty(p)) {
                 var r = new RegExp(p);
                 var m = r.exec(my.buffer);
                 if(m) { 
                   cmds[p](m);
                   break;
                 }
               }
             }
             return { command: "null" };
           };


           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.clearSelection();
             my.editor.setOverwrite(true);
             my.editor.setStyle('envi-normal-mode');
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
             my.editor.unsetStyle('envi-normal-mode');
           };

           
           that.exec = exec;
           that.attach = attach;
           that.detach = detach;

           return that;
         };
       }); 



/*****************************/
/*   ENVI INSERT MODE        */
/*****************************/
define('ace/keyboard/envi/insert',
       ['require', 'exports', 'module', 'ace/lib/keys', 
        'ace/keyboard/envi/mode'],
       function(require, exports, module) {
         "use strict"

         var mode = require('./mode').mode;

         require('../../lib/dom').importCssString('\
           .envi-insert-mode .ace_cursor {\
             border-left: 2px solid #111;\
           }', 'enviInsertMode');


         /**
          * Envi Insert  Mode 
          *
          * In charge of handling envi insert  mode
          * 
          * @param { editor }
          */
         exports.insert = function(spec, my) {
           my = my || {};

           // public

           // protected
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 


           var that = mode({ editor: spec.editor,
                             mode: 'insertMode' }, my);

           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.setOverwrite(false);
             my.editor.setStyle('envi-insert-mode');
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
             my.editor.unsetStyle('envi-insert-mode');
           };


           that.attach = attach;
           that.detach = detach;

           return that;
         };
       }); 


/*****************************/
/*   ENVI VISUAL MODE        */
/*****************************/
define('ace/keyboard/envi/visual',
       ['require', 'exports', 'module', 'ace/lib/keys', 
        'ace/keyboard/envi/mode'],
       function(require, exports, module) {
         "use strict"

         var mode = require('./mode').mode;

         /**
          * Envi Visual  Mode 
          *
          * In charge of handling envi visual mode
          * 
          * @param { editor }
          */
         exports.visual = function(spec, my) {
           my = my || {};

           // public

           // protected
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 


           var that = mode({ editor: spec.editor,
                             mode: 'visualMode' }, my);

           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.setOverwrite(false);
             my.editor.setStyle('envi-visual-mode');
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
             my.editor.unsetStyle('envi-visual-mode');
           };


           that.attach = attach;
           that.detach = detach;

           return that;
         };
       }); 


/*****************************/
/*   ENVI VISUAL LINE MODE        */
/*****************************/
define('ace/keyboard/envi/visual_line',
       ['require', 'exports', 'module', 'ace/lib/keys', 
        'ace/keyboard/envi/mode'],
       function(require, exports, module) {
         "use strict"

         var mode = require('./mode').mode;

         /**
          * Envi Visual Line Mode 
          *
          * In charge of handling envi visual mode
          * 
          * @param { editor }
          */
         exports.visual_line = function(spec, my) {
           my = my || {};

           // public

           // protected
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 


           var that = mode({ editor: spec.editor,
                             mode: 'visualLineMode' }, my);

           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.setOverwrite(false);
             my.editor.setStyle('envi-visual-mode');
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
             my.editor.unsetStyle('envi-visual-mode');
           };


           that.attach = attach;
           that.detach = detach;

           return that;
         };
       }); 


/*****************************/
/*   ENVI OPERATORS          */
/*****************************/
define('ace/keyboard/envi/operators',
       ['require', 'exports', 'module', 'ace/search', 'ace/range'],
       function(require, exports, module) {
         "use strict"

         /*************************/
         /*  OPERATORS IMPL       */
         /*************************/
         module.exports = {
           'd': function(editor, range) {
             var selRange = editor.getSelectionRange();
             console.log(selRange);
           }
         };
         
       });


/*****************************/
/*   ENVI MOTIONS            */
/*****************************/
define('ace/keyboard/envi/motions',
       ['require', 'exports', 'module', 'ace/search', 'ace/range'],
       function(require, exports, module) {
         "use strict"

         /**
          * Helper Regular Expressions
          */
         var wht_spc = /\s/;
         var wrd_sep = /[.\/\\()\"'-:,.;<>~!@#$%^&*|+=\[\]{}`~?]/;

         /**
          * Stream object
          *
          * Allow to stream characters from a given
          * position as if iterating over a string
          *
          * @param spec {editor, pos}
          */
         var stream = function(spec, my) {
           my = my || {};

           my.editor = spec.editor;
           my.pos = { column: spec.pos.column, row: spec.pos.row };
           my.line = my.editor.session.getLine(my.pos.row);
           my.chr = my.line[my.pos.column] || '\n';
           my.lines = 0;

           // public
           var next;
           var prev;

           // private
           var next_line;
           var prev_line;
           
           var that = {};

           next = function() {
             my.chr = my.line[++my.pos.column] || next_line()
             return my.chr;
           };
           
           prev = function() {
             my.chr = my.line[--my.pos.column] || prev_line();
             return my.chr;
           };

           next_line = function() {
             if(my.pos.row === my.editor.session.getLength() - 1)
               return;
             // will retrun \n at end of line and go to next line 
             // for my.pos.row === my.line.length + 1
             if(my.pos.column === my.line.length)
               return '\n';
             my.pos.column = 0;
             my.pos.row++;
             my.line = my.editor.session.getLine(my.pos.row);
             my.lines++;
             return my.line[0] || '\n';
           };

           prev_line = function() {
             if(my.pos.row === 0)
               return;
             my.pos.row--;
             my.line = my.editor.session.getLine(my.pos.row);
             my.pos.column = my.line.length;
             my.lines--;
             return '\n';
           };

           that.next = next;
           that.prev = prev;
           that.chr = function() { return my.chr; };
           that.pos = function() { return my.pos; };
           that.lines = function() { return my.lines; };
           
           return that;
         }; 


         /*************************/
         /*  MOTIONS IMPL         */
         /*************************/
         module.exports = {
           'h': function(editor, beg, pos, param) {
             if(pos.column > 0) {
               pos.column--;
             }
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'l': function(editor, beg, pos, param) {
             var len = editor.session.getLine(pos.row).length;
             if(pos.column < len - 1) {
               pos.column++;
             }
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'j': function(editor, beg, pos, param) {
             if(pos.row < editor.session.getLength() - 1) {
               pos.row++;
               var len = editor.session.getLine(pos.row).length;
               if(pos.column < editor.keyBinding.$data.cursor_column)
                 pos.column = editor.keyBinding.$data.cursor_column;
               if(pos.column > len - 1)
                 pos.column = len - 1;
             }
             return { beg: beg, dst: pos };
           },
           'k': function(editor, beg, pos, param) {
             if(pos.row > 0) {
               pos.row--;
               var len = editor.session.getLine(pos.row).length;
               if(pos.column < editor.keyBinding.$data.cursor_column)
                 pos.column = editor.keyBinding.$data.cursor_column;
               if(pos.column > len - 1)
                 pos.column = len - 1;
             }
             return { beg: beg, dst: pos };
           },
           '$': function(editor, beg, pos, param) {
             var len = editor.session.getLine(pos.row).length;
             pos.column = len - 1;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           '^': function(editor, beg, pos, param) {
             var line = editor.session.getLine(pos.row);
             pos.column = /^\s*/.exec(line)[0].length;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           '0': function(editor, beg, pos, param) {
             pos.column = 0;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'e': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});
             
             str.next();
             while(str.chr() && wht_spc.test(str.chr())) str.next();

             if(str.chr() && wrd_sep.test(str.chr())) {
               while(str.chr() && wrd_sep.test(str.chr())) str.next();
             }
             else { 
               while(str.chr() && !wrd_sep.test(str.chr()) && 
                     !wht_spc.test(str.chr())) str.next();
             }
             str.prev(); 

             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'E': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             var cur = str.next();
             if(typeof str.chr() === 'undefined') return pos;
             var nxt = str.next();
             while(str.chr() && 
                   !(!wht_spc.test(cur) && wht_spc.test(nxt)) &&
                   str.lines() < 2) {
               cur = nxt;
               nxt = str.next();
             }
             str.prev();
             if(str.lines() >= 2) str.prev();
             
             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'w': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             if(str.chr() && wrd_sep.test(str.chr())) {
               while(str.chr() && wrd_sep.test(str.chr())) str.next();
             }
             else {
               while(str.chr() && !wrd_sep.test(str.chr()) && 
                     !wht_spc.test(str.chr())) str.next();
             }

             while(str.chr() && wht_spc.test(str.chr()) && str.lines() < 2) str.next();
             if(!str.chr()) str.prev();
             if(str.lines() >= 2) str.prev();

             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'W': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             var cur = str.chr();
             var nxt = str.next();
             while(str.chr() && 
                   !(wht_spc.test(cur) && !wht_spc.test(nxt)) && 
                   str.lines() < 2) {
               cur = nxt;
               nxt = str.next();
             }
             if(str.lines() >= 2) str.prev();
             if(typeof str.chr() === 'undefined') str.prev();
             
             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'b': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             str.prev();
             while(str.chr() && wht_spc.test(str.chr())) str.prev();

             if(str.chr() && wrd_sep.test(str.chr())) {
               while(str.chr() && wrd_sep.test(str.chr())) str.prev();
             }
             else { 
               while(str.chr() && !wrd_sep.test(str.chr()) && 
                     !wht_spc.test(str.chr())) str.prev();
             }
             str.next(); 

             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'B': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             var cur = str.prev();
             if(typeof str.chr() === 'undefined') return pos;
             var prv = str.prev();
             while(str.chr() && 
                   !(!wht_spc.test(cur) && wht_spc.test(prv)) &&
                   str.lines() > -2) {
               cur = prv;
               prv = str.prev();
             }
             str.next();
             if(str.lines() <= -2) str.next();
             
             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'ge': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             if(str.chr() && wrd_sep.test(str.chr())) {
               while(str.chr() && wrd_sep.test(str.chr())) str.prev();
             }
             else {
               while(str.chr() && !wrd_sep.test(str.chr()) && 
                     !wht_spc.test(str.chr())) str.prev();
             }

             while(str.chr() && wht_spc.test(str.chr()) && str.lines() > -2) str.prev();
             if(!str.chr()) str.next();
             if(str.lines() <= -2) str.next();

             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'gE': function(editor, beg, pos, param) {
             var str = stream({editor: editor, pos: pos});

             var cur = str.chr();
             var prv = str.prev();
             while(str.chr() && 
                   !(wht_spc.test(cur) && !wht_spc.test(prv)) && 
                   str.lines() > -2) {
               cur = prv;
               prv = str.prev();
             }
             if(str.lines() <= -2) str.next();
             if(typeof str.chr() === 'undefined') str.prev();
             
             editor.keyBinding.$data.cursor_column = str.pos().column;
             return { beg: beg, dst: str.pos() };
           },
           'f': function(editor, beg, pos, param) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column] === param) ? 1 : 0);
             var count = line.substr(start).indexOf(param);
             if(count > 0)
               pos.column = start + count;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'F': function(editor, beg, pos, param) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column] === param) ? -1 : 0);
             var str = line.substr(0, start + 1);
             var count = start;
             while(str[count] !== param && count >= 0) count--; 
             if(count >= 0)
               pos.column = count;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           't': function(editor, beg, pos, param) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column + 1] === param) ? 2 : 1);
             var count = line.substr(start).indexOf(param);
             if(count > 0)
               pos.column = start + count - 1;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'T': function(editor, beg, pos, param) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column - 1] === param) ? -2 : -1);
             var str = line.substr(0, start);
             var count = start;
             while(str[count - 1] !== param && count > 0) count--; 
             if(count > 0)
               pos.column = count;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'G': function(editor, beg, pos, param) {
             pos.row = editor.session.getLength() - 1;
             var line = editor.session.getLine(pos.row);
             pos.column = /^\s*/.exec(line)[0].length;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'gg': function(editor, beg, pos, param) {
             pos.row = 0;
             pos.column = 0;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           }
         };
         //var wht_spc = /\s/;
         //var wrd_sep = /[\s.\/\\()\"'-:,.;<>~!@#$%^&*|+=\[\]{}`~?]/;

       });
