define(function() {

  util = {};

  util.drawSquare(ctx, coords, size, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(coords.x, coords.y, size, size);
  };

  util.isPlainObject = function(x) {
    return typeof x == 'object' && x.constructor == Object;
  };

  util.each = function(obj, f) {
    if(obj instanceof Array) {
      for(var i = 0; i < obj.length; ++i) f(obj[i], i);
    } else if(isPlainObject(obj)) {
      for(var key in obj) f(obj[key], key);
    }
  };

  util.deepCopy = function(obj) {
    /* Copy an object, with new Arrays and Object members */

    function _copyInto(obj, ret) {

      each(obj, function(val, key) {
        if(val instanceof Array) {
          // Copy array
          ret[key] = [];
          _copyInto(val, ret[key]);

        } else if(typeof val == 'object' && val.constructor == Object) {
          // Copy object
          ret[key] = {};
          _copyInto(val, ret[key]);

        } else {
          // Base case
          ret[key] = val;
        }

      });

    }

    var ret = {};
    _copyInto(obj, ret);
    return ret;
  };

  util.extend = function(dest, src) {
    /*
     * Return a new object with all properties of dest
     * and all properties of src. Those of src take precedence.
     */

    function _extend(src, ret) {
      each(src, function(val, key) {

        // Set to empty object if not present
        if(ret[key] === undefined) ret[key] = {};

        // If value is object, recurse
        if(isPlainObject(val)) {
          _extend(val, ret[key]);
        } else if(val instanceof Array) {
          ret[key] = deepCopy(val);
        } else {
          ret[key] = val;
        }

      });
      return ret;
    }

    return _extend(src, deepCopy(dest));

  };

  return util;

});
