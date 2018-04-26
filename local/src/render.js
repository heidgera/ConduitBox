'use strict';

obtain([], ()=> {

  var setAttributes = (el, attrs)=> {
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        el.setAttribute(key, attrs[key]);
      }
    }
  };

  var parseElement = (item)=> {
    var content = null;
    var obj = null;
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        if (key == '_') {
          if (typeof item[key] == 'string') content = item[key];
          else content = getChildren(item[key]);
        } else {
          obj = µ(`+${key}`);
          setAttributes(obj, item[key]);
        }
      }
    }

    if (typeof content == 'object') {
      content.forEach(obj.appendChild.bind(obj));
    } else obj.textContent = content;

    return obj;
  };

  var getChildren = (childArray)=> {
    return childArray.map(parseElement);
  };

  exports.render = (pack, parent)=> {
    getChildren(pack).forEach(parent.appendChild.bind(parent));
  };

  provide(exports);
});

//[{div: {id: 'test'}, _: {[{div: {id: 'test1'}, _: 'string'}, {div: {id: 'test2'}, _: 'string'}]}}]
