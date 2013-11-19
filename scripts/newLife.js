define(['util'], function (util) {
  // Defaults
  var lifeDefaults = {
    cellSize : 10,
    cellFill : '#87AFC7',
    cellBorder : '25383C'
  };

  function Life(options) {
    /* Encapsulate a single Life game */

    options = options || {};
    this.options = util.extend(lifeDefaults, options);

  }

  Life.prototype.click = function(e) {
    var x = e.x - lifeCanvas.offsetLeft;
    var y = e.y - lifeCanvas.offsetTop;

    // Account for the border
    var re = /px$/;
    var canvasStyle = getComputedStyle(lifeCanvas);
    x -= canvasStyle.getPropertyValue('border-left-width').replace(re, '');
    y -= canvasStyle.getPropertyValue('border-top-width').replace(re, '');

    // Invalid click
    if(x < 0 || y < 0) return;

    x = Math.floor(x / CELL_SIZE);
    y = Math.floor(y / CELL_SIZE);

    var cell = gameGrid[x][y];

    // Flip the alive state
    cell.alive ^= true;

    // Draw or clear as appropriate
    cell.alive ? drawLifeCell(lifeCtx, x, y) : clearLifeCell(lifeCtx, x, y);

  };

  Life.prototype.init = function() {
    /* Initialize handlers and etc. */
    var controls = [
      { id : 'startLife', handler : startLife, event : 'click' },
      { id : 'stopLife', handler : stopLife, event : 'click' },
      { id : 'clearLife', handler : clearLife, event : 'click' },
      { id : 'lifeSpeed', handler : updateLifeSpeed, event : 'change' }
    ];

    // Create an event handler
    function makeHandler(f) {
      return function(e) { f(); e.preventDefault(); };
    }

    util.each(controls, function(control) {
      var el = document.getElementById(control.id);
      el.addEventListener(control.event, makeHandler(control.handler));
    });

  };

  return {
    deepCopy : deepCopy,
    extend : extend
  };

});
