// Size of one block in pixels
var BLOCK_SIZE = 10;
var CANVAS_SIZE = {x: 200, y: 200};

// Constants for the keycodes of buttons
var UP_ARROW = 38;
var DOWN_ARROW = 40;
var LEFT_ARROW = 37;
var RIGHT_ARROW = 39;
var W_KEY = 87;
var S_KEY = 83;
var A_KEY = 65;
var D_KEY = 68;

var ctx = document.getElementById('snake').getContext('2d');
var snake = null;

function Block(x, y, fill) {
    // Set the coordinates
    this.x = x;
    this.y = y;

    // Draw the block
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);

    this.undraw = function() {
        // Clear the block
        ctx.clearRect(this.x, this.y, BLOCK_SIZE, BLOCK_SIZE);
    };
}


function Snake() {
    /* Snake function (a class, really) to be a snake for the game */

    // Constant fill colour of the snake
    this.SNAKE_COLOUR = '#000000';
    this.FOOD_COLOUR = '#565656';

    // Initial score
    this.score = 0;

    ///////////////////////////////////////////////////////////////////////////

    this.eatFood = function() {
        /* Grow the snake by one, delete the old food and make a new one */

        // Old end of the snake
        var oldEnd = this.body[this.body.length - 1];

        // x and y of new body piece to add
        var x = oldEnd.x;
        var y = oldEnd.y;

        // Add a new block to the body (at the end)
        this.body.push(new Block(x, y, this.SNAKE_COLOUR));

        this.score += 1;
        updateScore(this.score);

        // No need to remove old food block - it has been drawn over by the snake
        // Create a new food block
        this.food = this.genFood();
    }

    ///////////////////////////////////////////////////////////////////////////

    this.moveSnake = function() {
        /* Move the snake in the specified direction */

        // The end of the snake
        var tail = this.body.pop();

        // Amount to move
        var move = {x: 0, y: 0};

        // Clear the old tail
        tail.undraw();

        // Change the move object dependent on the direction
        switch(this.commands.current || this.direction) {
            case 'l':
                move.x = -1;
                break;
            case 'r':
                move.x = 1;
                break;
            case 'u':
                move.y = -1;
                break;
            case 'd':
                move.y = 1;
                break;
        }

        if(this.commands.current) {
            this.direction = this.commands.current;
        }
        this.commands.current = this.commands.next;
        this.commands.next = '';

        // Get the head of the snake
        var head = this.body[0];

        // Calculate the new x and y coordinates
        var x = head.x + BLOCK_SIZE * move.x;
        var y = head.y + BLOCK_SIZE * move.y;

        // Add a new head to the snake
        this.body.unshift(new Block(x, y, this.SNAKE_COLOUR));

        // Check if snake intersects anything
        if(this.hitSelf() || this.hitWall()) {
            // End of game
            return false;
        } else if(this.hitFood()) {
            // Eat a food
            this.eatFood();
        }
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////

    this.hitWall = function() {
        /* Determine if the snake intersected the edge of the canvas */

        var head = this.body[0];

        return head.x >= CANVAS_SIZE.x || head.y >= CANVAS_SIZE.y || head.x < 0 || head.y < 0;
    }

    this.hitSelf = function() {
        /* Determine if the snake intersected itself */

        // The head of the snake is the only thing that has moved
        var head = this.body[0];

        for(var i=1, len=this.body.length; i < len; ++i) {
            // Loop through the body and determine if the head has the same
            // coordinates as another piece of the body
            if(head.x == this.body[i].x && head.y == this.body[i].y) {
                return true;
            }
        }
    }

    this.hitFood = function() {
        /* Determine if the snake intersected its food */

        // The head of the snake is the only thing that has moved
        var head = this.body[0];

        // Head has same coordinates as food
        return head.x == this.food.x && head.y == this.food.y;
    }

    ///////////////////////////////////////////////////////////////////////////

    this.genFood = function() {
        /* Generate a food block for this snake */

        var x = 0;
        var y = 0;

        while(true) {
            // Do not create the food block inside the snake

            var intersect = false;
            // New x and y coordinates
            x = Math.floor(Math.random() * (CANVAS_SIZE.x / BLOCK_SIZE)) * BLOCK_SIZE;
            y = Math.floor(Math.random() * (CANVAS_SIZE.y / BLOCK_SIZE)) * BLOCK_SIZE;

            // Check to see if x and y are in the snake
            for(var i=1, len=this.body.length; i < len; ++i) {
                if(this.body[i].x == x && this.body[i].y == y) {
                    // Intersection
                    intersect = true;
                    break;
                }
            }

            // No intersection - coordinates are good
            if(!intersect) {
                break;
            }
        }

        // New food block
        var food = new Block(x, y, this.FOOD_COLOUR);
        return food;
    }

    ///////////////////////////////////////////////////////////////////////////

    this.changeCommand = function(pressed, opposite) {
        /* Function to change the command depending on its value */

        if(this.commands.current) {
            // There is already a current command for the next move
            if(this.commands.current != opposite) {
                // The current command is not the opposite of what was pressed
                // If it was then on the NEXT command, the snake would go back
                // on itself
                this.commands.next = pressed;
            }
        } else if(this.direction != opposite) {
            // There is not a current command
            // Change the direction so long as the pressed key is not the
            // opposite direction of the snake
            this.commands.current = pressed;
        }
    }

    this.changeDirection = function(keyCode) {
        /* Function for event listener for keypress */

        // Change the direction based on the key press
        switch(keyCode) {
            case UP_ARROW:
            case W_KEY:
                this.changeCommand('u', 'd');
                break;
            case DOWN_ARROW:
            case S_KEY:
                this.changeCommand('d', 'u');
                break;
            case LEFT_ARROW:
            case A_KEY:
                this.changeCommand('l', 'r');
                break;
            case RIGHT_ARROW:
            case D_KEY:
                this.changeCommand('r', 'l');
                break;
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    /* INITIALIZATION OF OBJECT */

    this.commands = {current: '', next: ''};

    // Add initial direction
    this.direction = 'l';

    this.body = [];

    // Initialize body
    for(var i=0; i < 3; ++i) {
        this.body.push(new Block(100 + 10*i, 100, this.SNAKE_COLOUR))
    }

    // Add Initial food
    this.food = this.genFood();
}

function clearCanvas() {
    ctx.fillStyle = '#c0c0c0';
    ctx.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
}

function updateScore(score) {
    // Update the current score
    var current = document.getElementById('currentScore');
    current.innerHTML = score;

    // Update the high score if it is higher
    var high = document.getElementById('highScore');
    if(high.innerHTML < score) {
        high.innerHTML = score;
    }
}

function playSnake() {
    /* Main function to play the snake game */

    // Already playing
    if(snake) { return; }

    clearCanvas();
    updateScore(0);

    snake = new Snake();

    // Listen for keyboard events
    document.addEventListener('keydown', function() { snake.changeDirection(event.keyCode); }, true);

    function intervalFunction() {
        if(!snake.moveSnake()) {
            // Stop the interval
            clearInterval(interval);

            // Some cleanup of snake
            for(var i=0, len=snake.body.length; i < len; ++i) {
                delete snake.body[i];
            }
            delete snake.food;

            // Set snake to null so we can replay
            snake = null;
        }
    }

    // Move snake every .2 seconds while the moveSnake function returns true
    var interval = setInterval(intervalFunction, 115);
}
