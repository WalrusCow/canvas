define(['lib/sg/sg', 'lib/sg/util'], function(sg, util) {

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

    var opposite = OPPOSITES[this.dir];

    // The initial offset (we need to build the snake in the opposite
    // direction that it is moving)
    var offset = sg.copyPoint(DIR_MAP[opposite]);

    for (var i = 0; i < 3; ++i) {
      // Use dir map here
      var posn = sg.addPoints(opt.startPoint, offset);
      offset = sg.addPoints(offset, DIR_MAP[opposite]);

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

    if (this._hitFood()) {
      // We ate food, so make new food
      this.newFood();

    } else {
      // We didn't eat food, so remove the last piece of the Snake
      // End of the snake
      var tail = this.body.pop();
      tail.undraw();
    }

    // Create and draw the new head (after undrawing tail in case of conflict)
    this.body.unshift(new this.Block(newHeadCoords, this.blockConfig));
    this.body[0].draw();

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
    // `hc` is shorthand for `headCoords`
    var hc = this.body[0].coords;

    // Check for intersection of self
    for (var i = 1; i < this.body.length; ++i) {
      if (sg.pointsEqual(hc, this.body[i].coords)) {
        return true;
      }
    }

    // Shorthand
    var gs = this.gameSize;

    // Check for intersection of wall
    return (hc.x >= gs.x) || (hc.y >= gs.y) || (hc.x < 0) || (hc.y < 0);
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
      blockSize: 10,
      gameSpeed: 120,
      controlSelector: 'Snake-',
      snakeOptions: {
        dir: 'r',
        startPoint: {
          x: 8,
          y: 5
        },
        blockConfig: {
          fill: '#000000'
        },
        foodConfig: {
          fill: '#AA1F1F'
        }
      }
    };

    options = options || {};
    this.options = util.extend(defaultOptions, options);

    // Initialize controls and control objects
    this._initControls();

    // Also set the game size
    this.options.snakeOptions.gameSize = {
      x: Math.floor(this.canvasControl.width / this.options.blockSize),
      y: Math.floor(this.canvasControl.height / this.options.blockSize)
    };

    var blockOptions = {
      ctx : this.ctx,
      squareSize : this.options.blockSize
    };

    // Create the class that will be used to generate blocks
    this.Block = sg.GameGrid(blockOptions);

    // Create the snake we'll be playing with
    this.snake = new Snake(this.Block, this.options.snakeOptions);
  }

  SnakeGame.prototype.start = function() {
    /* Start the game. */
    if (!this._interval) {
      // Always call with `this` as context
      var ticker = this._tick.bind(this);
      this._interval = setInterval(ticker, this.options.gameSpeed);

      // We need to focus the canvas for keydown events to fire
      this.canvasControl.focus();
    }
  };

  SnakeGame.prototype.gameOver = function() {
    /* End of the game. */
    clearInterval(this._interval);
    delete this._interval;
    this.ctx.clearRect(0, 0, this.canvasControl.width, this.canvasControl.height);
    this.snake = new Snake(this.Block, this.options.snakeOptions);
  };

  SnakeGame.prototype._tick = function() {
    /* One tick of the game. */
    if (!this.snake.move()) {
      // Move failed - game over
      this.gameOver();
      clearInterval(this._interval);
    }
  };

  SnakeGame.prototype.keydown = function(e) {
    /* Event listener for keypress */
    // Game not yet started - do nothing
    if (!this._interval) return;

    // Change the direction based on the key press
    switch (e.keyCode) {
      case UP_ARROW:
      case W_KEY:
        this.snake.changeDirection('u');
        e.preventDefault();
        break;
      case DOWN_ARROW:
      case S_KEY:
        this.snake.changeDirection('d');
        e.preventDefault();
        break;
      case LEFT_ARROW:
      case A_KEY:
        this.snake.changeDirection('l');
        e.preventDefault();
        break;
      case RIGHT_ARROW:
      case D_KEY:
        this.snake.changeDirection('r');
        e.preventDefault();
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
