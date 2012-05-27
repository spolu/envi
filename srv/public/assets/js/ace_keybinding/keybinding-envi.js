/*****************************/
/*   KEYBINDING ENVI         */
/*****************************/
define('ace/keyboard/envi', 
       ['require', 'exports', 'module' , 'ace/lib/keys', 
       'ace/keyboard/envi/normal'], 
       function(require, exports, module) {
  "use strict"

  exports.handler = {

    handleKeyboard: function(data, hashId, key, keyCode, e) {
      if(hashId !== 0 && (key == "" || key == "\x00"))
        return null;

      if(hashId === 1) key = "ctrl-" + key;
      if(hashId === 2) key = "option-" + key;
      if(hashId === 4) key = "shitd-" + key;

      if(data.state === 'normal') {
      }
      else {
        if(key === 'esc' || key === 'ctrl-[') {
          data.state = 'normal';
          // stop
        }
        else if(key === 'ctrl-w') {
          return { command: "removewordleft" };
        }
      } 
    },

    attach: function(editor) {
      
    },

    detach: function(editor) {
    }
  };
});


/*****************************/
/*   ENVI MODE BASE          */
/*****************************/
define('ace/keyboard/envi/mode'
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
            
           // public
           var currentMode;       /* currentMode(); */
           var lineMode;          /* lineMode(); */

           var setNormalMode;     /* setNormalMode(); */
           var setInsertMode;     /* setInsertMode(); */
           var setVisualMode;     /* setInsertMode(lineMode); */


           var that = {};

           /**
            * Listens for `enviChangeMode` events to call attach
            * and detach functions on subclassing mode objects
            */
           my.editor.on('enviChangeMode', function(mode) {
             if(that.currentMode() === my.mode) {
               if(that.attach) that.attach();
             }
             else {
              if(that.detach) that.detach();
             }
           });


           /**
            * Returns the current mode
            */
           currentMode = function() {
             return my.editor.keyBinding.$data.state;
           };

           /**
            * Returns whether we're in lineMode (visual)
            */
           lineMode = function() {
             return my.editor.keyBinding.$data.state;
           };


           /**
            * Sets the editor in Normal mode and resets it
            */
           setNormalMode = function() {
             my.editor.keyBinding.$data.state = 'normalMode';
             my.editor.keyBinding.$data.lineMode = false;
             my.editor.keyBinding.$data.buffer = '';
             my.editor._emit('enviChangeMode', currentMode());
           };

           /**
            * Sets the editor in Insert mode and resets it
            */
           setInsertMode = function() {
             my.editor.keyBinding.$data.state = 'insertMode';
             my.editor.keyBinding.$data.lineMode = false;
             my.editor.keyBinding.$data.buffer = '';
             my.editor._emit('enviChangeMode', currentMode());
           };

           /**
            * Sets the editor in Visual Mode and resets it
            */
           setVisualMode = function(lineMode) {
             my.editor.keyBinding.$data.state = 'visualMode';
             my.editor.keyBinding.$data.lineMode = lineMode;
             my.editor.keyBinding.$data.buffer = '';
             my.editor._emit('changeEnviMode', currentMode());
           };


           that.currentMode = currentMode;
           that.lineMode = lineMode;

           that.setNormalMode = setNormalMode;
           that.setInsertMode = setInsertMode;
           that.setVisualMode = setVisualMode;
           

           return that;
         };
       });


/*****************************/
/*   ENVI NORMAL MODE        */
/*****************************/
define('ace/keyboard/envi/normal'
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

           // private
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 

           var that = mode({ editor: spec.editor,
                             mode: 'normalMode' }, my);

           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.clearSelection();
             my.editor.setOverWrite(true);
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
           };


           return that;
         };
       }); 



/*****************************/
/*   ENVI INSERT MODE        */
/*****************************/
define('ace/keyboard/envi/insert'
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

           // private
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 


           var that = mode({ editor: spec.editor,
                             mode: 'insertMode' }, my);

           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.setOverWrite(false);
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
           };


           return that;
         };
       }); 


/*****************************/
/*   ENVI VISUAL MODE        */
/*****************************/
define('ace/keyboard/envi/visual'
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

           // private
           var attach;  /* attach(); */
           var detach;  /* detach(); */ 


           var that = mode({ editor: spec.editor,
                             mode: 'visualMode' }, my);

           /**
            * Called by base class when the mode is acitvated
            */ 
           attach = function() {
             my.editor.setOverWrite(false);
           };

           /**
            * Called by base class when the mode is extied
            */
           detach = function() {
           };


           return that;
         };
       }); 

