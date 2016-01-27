define(function() {

// May be used as a mixin:
//   in constructor:
//     EventEmitter.call(this)
//   extending prototype:
//     EventEmitter.extend(MyClass.prototype)
function EventEmitter() {
  this.listeners = {};
}

EventEmitter.extend = function (Klass) {
  for (var key in this.prototype) {
    Klass.prototype[key] = this.prototype[key]
  }
}

var Ep = EventEmitter.prototype;

Ep.trigger = function (eventName /*, args...*/) {
  var i, args, listeners;
  if (! this.listeners.hasOwnProperty(eventName)) {
    return;
  }
  listeners = this.listeners[eventName];
  args = [].slice.call(arguments, 1)
  for (i = 0; i < this.listeners[eventName].length; i++) {
    listeners[i].func.apply(listeners[i].context, args);
  }
  return this;
};

Ep._addListener = function(eventName, listener) {
  if (! this.listeners.hasOwnProperty(eventName)) {
    this.listeners[eventName] = [];
  }
  this.listeners[eventName].push(listener);
}

Ep.on = function (eventName, func, context) {
  this._addListener(eventName, {
    func: func,
    context: context
  });
};

Ep.off = function (eventName, func, context) {
  var listeners, i;
  if (!context) context = null;
  if (! this.listeners.hasOwnProperty(eventName) ||
      this.listeners.length === 0) {
    return false;
  }
  if (!func) {
    this.listeners[eventName] = [];
    return true;
  }
  listeners = this.listeners[eventName];
  i = 0;
  while (i < listeners.length) {
    if (listeners[i].func === func &&
        listeners[i].context === context) {
      listeners.splice(i, 1);
      return true;
    }
  }
  return false;
}

Ep.once = function (eventName, func, context) {
  if (!context) context = null;
  var listener = {}, i;
  this._addListener(eventName, listener);
  listener.context = this;
  listener.func = function () {
    var listeners = this.listeners[eventName];
    func.apply(context, arguments);
    for (i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        return;
      }
    }
  };
  return this;
}

return EventEmitter;

});

// lazy tests
// foo = new EventEmitter
// foo.on('bar', function(){
//   console.log('bar');
// });
// foo.trigger('bar');
// foo.off('bar');
// foo.trigger('bar');
// foo.once('baz', function(){
//   console.log('baz');
// });
// foo.trigger('baz');
// foo.trigger('baz');
// foo.once('dalmation', function (dogName) {
//   console.log('new dog: ' + dogName);
// });
// foo.trigger('dalmation', 'sparky');
// foo.trigger('dalmation', 'froggy');
