define('ace/theme/envi', function(require, exports, module) {
  exports.isDark = true;
  exports.cssClass = "ace-envi";
  
  exports.cssText = "\
    .ace-envi.ace_editor {\
      font-size: 11px;\
    }\
    \
    .ace-envi .ace_editor.ace_focus {\
      border: 2px solid #327fbd;\
    }\
    \
    .ace-envi .ace_gutter {\
      background: #484848;\
      color: #333;\
    }\
    \
    .ace-envi .ace_gutter .ace_gutter-cell {\
      padding-left: 6px;\
    }\
    \
    .ace-envi .ace_gutter .ace_layer {\
      min-width: 20px;\
    }\
    \
    .ace-envi .ace_print_margin {\
      width: 1px;\
      background: #757575;\
    }\
    \
    .ace-envi .ace_scroller {\
      background-color: #2e2e31;\
    }\
    \
    .ace-envi .ace_text-layer {\
      cursor: text;\
      color: #b0b0b0;\
    }\
    \
    .ace-envi .ace_cursor {\
      border-left: 2px solid #7DA5DC;\
    }\
    \
    .ace-envi .ace_cursor.ace_overwrite {\
      border-left: 0px;\
      border-bottom: 1px solid #7DA5DC;\
    }\
    \
    .ace-envi .ace_marker-layer .ace_selection {\
      background: #000000;\
    }\
    \
    .ace-envi.multiselect .ace_selection.start {\
      box-shadow: 0 0 3px 0px #191919;\
      border-radius: 2px;\
    }\
    \
    .ace-envi .ace_marker-layer .ace_step {\
      background: rgb(102, 82, 0);\
    }\
    \
    .ace-envi .ace_marker-layer .ace_bracket {\
      margin: -1px 0 0 -1px;\
      border: 1px solid #BFBFBF;\
    }\
    \
    .ace-envi .ace_marker-layer .ace_active_line {\
      background: rgba(215, 215, 215, 0.031);\
    }\
    \
    .ace-envi .ace_marker-layer .ace_selected_word {\
      border: 1px solid #000000;\
    }\
    \
    .ace-envi .ace_invisible {\
      color: #555050;\
    }\
    \
    .ace-envi .ace_keyword, .ace-envi .ace_meta {\
      color:#927C5D;\
    }\
    \
    .ace-envi .ace_keyword.ace_operator {\
      color:#4B4B4B;\
    }\
    \
    .ace-envi .ace_constant.ace_language {\
      color:#39946A;\
    }\
    \
    .ace-envi .ace_constant.ace_numeric {\
      color:#46A609;\
    }\
    \
    .ace-envi .ace_invalid {\
      color:#FFFFFF;\
      background-color:#E92E2E;\
    }\
    \
    .ace-envi .ace_fold {\
      background-color: #927C5D;\
      border-color: #929292;\
    }\
    \
    .ace-envi .ace_support.ace_function {\
      color:#E92E2E;\
    }\
    \
    .ace-envi .ace_storage {\
      color:#E92E2E;\
    }\
    \
    .ace-envi .ace_string {\
      color:#5D90CD;\
    }\
    \
    .ace-envi .ace_comment {\
      color:#3C403B;\
    }\
    \
    .ace-envi .ace_entity.ace_other.ace_attribute-name {\
      color:#606060;\
    }\
    \
    .ace-envi .ace_markup.ace_underline {\
      text-decoration:underline;\
    }";
 
  var dom = require("../lib/dom"); 
  dom.importCssString(exports.cssText, exports.cssClass);
});
