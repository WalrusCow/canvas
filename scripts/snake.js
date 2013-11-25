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


  function Snake(Block, opt) {
    /*
     * Actual snake for game
     * Take in class to use for blocks and options.
     */

    this.Block = Block;
    this.dir = opt.dir;

    this.foodBlockConfig = opt.foodConfig;
    this.blockConfig = opt.blockConfig

    // Next commands to handle
    this.commands = {};

    this.body = [];
    for (var i = 0; i < 3; ++i) {
      this.body.push(new this.Block(

  }

  // Map directions to opposites
  Snake.opposites = { u : 'd', l : 'r', r : 'l', d : 'u' };

  Snake.prototype.changeDirection = function(dir) {
    // Current working direction (direction snake will be going)
    var cwd = this.dir;
    // Which command we are editing
    var ccmd = 'current';

    // Opposite direction to input
    var opp = Snake.opposites[dir];

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
      dir : 'l'
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
        this.snake.changeCommand('u');
        break;
      case DOWN_ARROW:
      case S_KEY:
        this.snake.changeCommand('d');
        break;
      case LEFT_ARROW:
      case A_KEY:
        this.snake.changeCommand('l');
        break;
      case RIGHT_ARROW:
      case D_KEY:
        this.snake.changeCommand('r');
        break;
    }

  };

  SnakeGame.prototype._initControls = function() {
    var controls = [
      { id : 'canvas', handler : this.keydown, event : 'keydown' },
      { id : 'start', handler : this.start, event : 'click' }
    ];

    sg.registerControls(this, controls, this.options.controlSelector);
    this.ctx = this.canvasControl.getContext('2d');

  };

  return SnakeGame;
});
