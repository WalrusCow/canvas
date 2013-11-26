define(['sg', 'util'], function(sg, util) {

  // Keycode constants
  var UP_ARROW = 38;
  var DOWN_ARROW = 40;
  var LEFT_ARROW = 37;
  var RIGHT_ARROW = 39;
  var W_KEY = 87;
  var S_KEY = 83;
  var A_KEY = 65;
  var D_KEY = 68;

  var OPPOSITES = { u: 'd', d: 'u', l: 'r', r: 'l' };
  var DIR_MAP = {
    u: { x: 0, y: -1 },
    d: { x: 0, y: 1 },
    l: { x: -1, y: 0 },
    r: { x: 1, y: 0 }
  };

  function Snake(Block, opt) {
    /*
     * Actual snake for game
     * Take in class to use for blocks and options.
     */

    this.Block = Block;
    this.dir = opt.dir;

    // Save the options for blocks (colour, etc)
    this.foodBlockConfig = opt.foodConfig;
    this.blockConfig = opt.blockConfig;

    // Save the size of the game map
    this.gameSize = opt.gameSize;

    // Next commands to handle
    this.commands = {};

    this.body = [];

    // The initial offset
    var offset = sg.copyPoint(DIR_MAP[this.dir]);

    for (var i = 0; i < 3; ++i) {
      // Use dir map here
      var posn = sg.addPoints(opt.startPoint, offset);
      offset = sg.addPoints(offset, DIR_MAP[this.dir]);

      // Add the block and draw it
      this.body.push(new this.Block(posn, this.blockConfig));
      this.body[i].draw();
    }

    // Generate new food
    this.newFood();
  }

  Snake.prototype.newFood = function() {
    /* Generate a new food piece for the Snake */

    // New point for food
    var foodPoint = {};

    // Do not create food inside the snake
    var intersect = true;
    while (intersect) {
      intersect = false;

      // Food point to use
      foodPoint.x = sg.randInt(0, this.gameSize.x);
      foodPoint.y = sg.randInt(0, this.gameSize.y);

      for (var i = 0; i < this.body.length; ++i) {
        if (sg.pointsEqual(this.body[i].coords, foodPoint)) {
          intersect = true;
          break;
        }
      }

    }

    // Create and draw the new food block
    this.food = new this.Block(foodPoint, this.foodBlockConfig);
    this.food.draw();
  };

  Snake.prototype.move = function() {
    /* Move the snake in the appropriate direction. */

    // End of the snake
    var tail = this.body.pop();
    tail.undraw();

    // Change direction if necessary
    this.dir = this.commands.current || this.dir;

    // Update command queue
    this.commands.current = this.commands.next;
    delete this.commands.next;

    // Amount to move by
    var move = DIR_MAP[this.dir];

    // Head of the snake
    var newHead = this.body[0];

    // Coordinates of the new head
    var newHeadCoords = sg.addPoints(move, newHead.coords);

    // Create and draw the new head
    this.body.unshift(new this.Block(newHeadCoords, this.blockConfig));
    this.body[0].draw();

    if (this._hitFood()) {
      // We ate food, so make new food
      this.newFood();

    } else {
      // We didn't eat food, so remove the last piece of the Snake
      // End of the snake
      var tail = this.body.pop();
      tail.undraw();
    }

    // Return true if the move was successful (didn't hit self)
    return !this._intersection();

  };

  Snake.prototype._hitFood = function() {
    /* Check if the Snake hit the food. */
    return sg.pointsEqual(this.body[0].coords, this.food.coords)
  };

  Snake.prototype._intersection = function() {
    /* Check if the Snake intersects itself or the wall. */

    // We only need to check against the head, since that's all that moved
    var headCoords = this.body[0].coords;

    // Check for intersection of self
    for (var i = 1; i < this.body.length; ++i) {
      if (sg.pointsEqual(headCoords, this.body[i].coords)) {
        return true;
      }
    }

    // Shorthand
    var gs = this.gameSize;

    // Check for intersection of wall
    return (headCoords.x >= gs.x) || (headCoords.y >= gs.y);
  };

  Snake.prototype.changeDirection = function(dir) {
    /*
     * Change the direction to be a new direction.  This is not as simple as
     * just assigning the property, because the Snake has a direction 'queue'
     * of length two.  This is in case the user hits one key soon after another,
     * before the Snake has made the first move.  Just setting the property
     * would overwrite the original move, which is probably not what was
     * intended.
     */

    // Current working direction (direction snake will be going)
    var cwd = this.dir;
    // Which command we are editing
    var ccmd = 'current';

    // Opposite direction to input
    var opp = OPPOSITES[dir];

    if (this.commands.current) {
      // If there is a current command, then we offset by one move. That is,
      // the current working direction will be the current command, and the
      // command we are writing would be the `next` command.
      cwd = this.commands.current;
      ccmd = 'next';
    }

    // Don't update if the desired direction is the same or opposite
    // since that would either be pointless or cause a loss
    if (cwd !== opp && cwd !== dir) {
      this.commands[ccmd] = dir;
    }
  };

  function SnakeGame(options) {
    /* Encapsulate a game of Snake */

    var defaultOptions = {
      blockSize : 10,
      snakeColour : '#000000',
      foodColour : '#565656',
      controlSelector : 'Snake-'
    };

    options = options || {};
    this.options = util.extend(defaultOptions, options);

    // Initialize controls and control objects
    this._initControls();

    var blockOptions = {
      ctx : this.ctx,
      squareSize : this.options.blockSize
    };

    // Create the class that will be used to generate blocks
    this.Block = sg.GameGrid(blockOptions);

    var snakeOptions = {
      dir: 'l',
      blockConfig: {
        fill: '#000000'
      },
      foodConfig: {
        fill: '#565656'
      }
    };

    // Create the snake we'll be playing with
    this.snake = new Snake(this.Block, snakeOptions);

  }

  SnakeGame.prototype.keydown = function(e) {
    /* Event listener for keypress */

    // Change the direction based on the key press
    switch (e.keyCode) {
      case UP_ARROW:
      case W_KEY:
        this.snake.changeDirection('u');
        break;
      case DOWN_ARROW:
      case S_KEY:
        this.snake.changeDirection('d');
        break;
      case LEFT_ARROW:
      case A_KEY:
        this.snake.changeDirection('l');
        break;
      case RIGHT_ARROW:
      case D_KEY:
        this.snake.changeDirection('r');
        break;
    }

  };

  SnakeGame.prototype._initControls = function() {
    /* Initialize the controls for the game. */
    var controls = [
      { id : 'canvas', handler : this.keydown, event : 'keydown' },
      { id : 'start', handler : this.start, event : 'click' }
    ];

    sg.registerControls(this, controls, this.options.controlSelector);
    // We also care about the context
    this.ctx = this.canvasControl.getContext('2d');

  };

  return SnakeGame;
});
