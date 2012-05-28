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
        'ace/keyboard/envi/mode'],
       function(require, exports, module) {
         "use strict"

         var mode = require('./mode').mode;

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
             if(/i$/.test(my.buffer)) {
               that.setInsertMode();
             }
             return { command: "null" };
           };


           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.clearSelection();
             my.editor.setOverwrite(true);
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
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
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
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
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
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
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
           };


           that.attach = attach;
           that.detach = detach;

           return that;
         };
       }); 

