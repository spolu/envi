/**
 * TODO:
 * MOTIONS:
 * --------
 *  - 'vib'
 *  - 'v*'
 *  COMMANDS:
 *  ---------
 *  - 'c'
 *  - 'd'
 *  - 'r'
 *  - 'y'
 *  - 'u'
 *  - 'o'
 *  - 'O'
 *  - 'J'
 *  - 'i'
 *  - 'I'
 *  - 'a'
 *  - 'A'
 *  - 'p'
 *  - 'P'
 *  - 's'
 *  - 'S'
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

         var modes = {};

         exports.handler = {

           handleKeyboard: function(data, hashId, key, keyCode, e) {
             if(hashId !== 0 && (key == "" || key == "\x00"))
               return null;

             if(hashId === 1) key = "ctrl-" + key;

             if(hashId === 1 || hashId === -1 || key === 'esc') {
               return modes[data.mode].push(key);
             }
           },

           attach: function(editor) {
             modes['normalMode']     = require('./envi/normal').normal({ editor: editor });
             modes['insertMode']     = require('./envi/insert').insert({ editor: editor });
             modes['visualMode']     = require('./envi/visual').visual({ editor: editor });
             modes['visualLineMode'] = require('./envi/visual_line').visual_line({ editor: editor });

             modes['normalMode'].setNormalMode();
           },

           detach: function(editor) {
           }
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
                   console.log('[' + my.mode + '] "' + my.buffer + '"'); 
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
               '([0-9]*)(c|d)([0-9]*)(f|F|t|T)(.)$': function(match) {
                 
               },
               '([0-9]*)(c|d)([1-9]*)(h|j|k|l|\\$|\\^|0|e|E|w|W|b|B|ge|gE|G|gg)$': function(match) {
                 
               },
               'i$': function(match) {
                 that.setInsertMode();
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
           'h': function(editor, beg, pos, arg) {
             if(pos.column > 0) {
               pos.column--;
             }
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'l': function(editor, beg, pos, arg) {
             var len = editor.session.getLine(pos.row).length;
             if(pos.column < len - 1) {
               pos.column++;
             }
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'j': function(editor, beg, pos, arg) {
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
           'k': function(editor, beg, pos, arg) {
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
           '$': function(editor, beg, pos, arg) {
             var len = editor.session.getLine(pos.row).length;
             pos.column = len - 1;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           '^': function(editor, beg, pos, arg) {
             var line = editor.session.getLine(pos.row);
             pos.column = /^\s*/.exec(line)[0].length;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           '0': function(editor, beg, pos, arg) {
             pos.column = 0;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'e': function(editor, beg, pos, arg) {
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
           'E': function(editor, beg, pos, arg) {
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
           'w': function(editor, beg, pos, arg) {
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
           'W': function(editor, beg, pos, arg) {
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
           'b': function(editor, beg, pos, arg) {
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
           'B': function(editor, beg, pos, arg) {
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
           'ge': function(editor, beg, pos, arg) {
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
           'gE': function(editor, beg, pos, arg) {
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
           'f': function(editor, beg, pos, arg) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column] === arg) ? 1 : 0);
             var count = line.substr(start).indexOf(arg);
             if(count > 0)
               pos.column = start + count;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'F': function(editor, beg, pos, arg) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column] === arg) ? -1 : 0);
             var str = line.substr(0, start + 1);
             var count = start;
             while(str[count] !== arg && count >= 0) count--; 
             if(count >= 0)
               pos.column = count;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           't': function(editor, beg, pos, arg) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column + 1] === arg) ? 2 : 1);
             var count = line.substr(start).indexOf(arg);
             if(count > 0)
               pos.column = start + count - 1;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'T': function(editor, beg, pos, arg) {
             var line = editor.getSession().getLine(pos.row);
             var start = pos.column + ((line[pos.column - 1] === arg) ? -2 : -1);
             var str = line.substr(0, start);
             var count = start;
             while(str[count - 1] !== arg && count > 0) count--; 
             if(count > 0)
               pos.column = count;

             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'G': function(editor, beg, pos, arg) {
             pos.row = editor.session.getLength() - 1;
             var line = editor.session.getLine(pos.row);
             pos.column = /^\s*/.exec(line)[0].length;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           },
           'gg': function(editor, beg, pos, arg) {
             pos.row = 0;
             pos.column = 0;
             editor.keyBinding.$data.cursor_column = pos.column;
             return { beg: beg, dst: pos };
           }
         };
         //var wht_spc = /\s/;
         //var wrd_sep = /[\s.\/\\()\"'-:,.;<>~!@#$%^&*|+=\[\]{}`~?]/;

       });
