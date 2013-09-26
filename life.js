var CELL_SIZE = 10;
var LIFE_CELL_FILL_COLOUR = '#87AFC7';
var LIFE_CELL_BORDER_COLOUR = '#25383C';
var lifeCanvas = document.getElementById('lifeCanvas');
var lifeCtx = lifeCanvas.getContext('2d');
var lifeInterval;
var gameGrid = makeGrid(Math.floor(lifeCanvas.width / CELL_SIZE),
                        Math.floor(lifeCanvas.height / CELL_SIZE));

// Add click support
lifeCanvas.addEventListener("mousedown", clickLife, false);

function clickLife(event) {
    var x = event.x;
    var y = event.y;

    x -= lifeCanvas.offsetLeft;
    y -= lifeCanvas.offsetTop;

    // Account for the border
    var re = /px$/;
    var canvasStyle = getComputedStyle(lifeCanvas);
    x -= canvasStyle.getPropertyValue('border-left-width').replace(re, '');
    y -= canvasStyle.getPropertyValue('border-top-width').replace(re, '');

    if(x < 0 || y < 0) {
        return;
    }

    x = Math.floor(x/CELL_SIZE);
    y = Math.floor(y/CELL_SIZE);

    gameGrid[x][y].alive = gameGrid[x][y].alive ^ true;
    if(gameGrid[x][y].alive) {
        drawLifeCell(lifeCtx, x, y);
    } else {
        clearLifeCell(lifeCtx, x, y);
    }
}

function clearLife() {
    for(var i = 0; i < gameGrid.length; ++i) {
        for(var j = 0; j < gameGrid[i].length; ++j) {
            gameGrid[i][j].alive = false;
            gameGrid[i][j].neighbours = 0;
        }
    }
    lifeCtx.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height);
}

function stopLife() {
    window.clearInterval(lifeInterval);
    lifeInterval = undefined;
}

function startLife(fps) {
    if (!lifeInterval) {
        // Default to 4
        lifeMain(fps || 4);
    }
}

function updateLifeSpeed(id) {
    stopLife();
    // Get fps from the slider
    var fps = document.getElementById(id).value;
    startLife(fps);
}

function lifeMain(fps) {
    function intervalFunction() { lifeLoop(gameGrid, lifeCtx); }
    lifeInterval = setInterval(intervalFunction, Math.floor(1000 / fps));
}

function sumNeighbours(gameGrid, x, y) {
    /* Add 1 to the number of neighbours of each neighbour
     * of gameGrid[x][y].
     */
    var width = gameGrid.length;
    var height = gameGrid[0].length;

    // Add to neighbours only if alive
    if(!gameGrid[x][y].alive) { return; }

    // Don't go out of bounds
    for(var i = (x && -1); i <= ((width-x-1) && 1); ++i) {
        for(var j = (y && -1); j <= ((height-y-1) && 1); ++j) {
            if(i || j) {
                gameGrid[x+i][y+j].neighbours += 1;
            }
        }
    }
}

function lifeLoop(gameGrid, lifeCtx) {
    var width = gameGrid.length;
    var height = gameGrid[0].length;
    // Count the neighbours of each
    for(var x = 0; x < width; ++x) {
        for(var y = 0; y < height; ++y) {
            sumNeighbours(gameGrid, x, y);
        }
    }
    // Check each to see if alive and reset the neighbours count
    for(var x = 0; x < width; ++x) {
        for(var y = 0; y < height; ++y) {
            cell = gameGrid[x][y];
            if(cell.alive) {
                // Live if neighbours are 2 or 3, die otherwise
                if(!(cell.neighbours == 2 || cell.neighbours == 3)) {
                    cell.alive = false;
                }
            } else {
                // Become alive if exactly 3 neighbours
                if(cell.neighbours == 3) {
                    cell.alive = true;
                }
            }
            cell.neighbours = 0;

            // Draw or clear the cell
            if(cell.alive) {
                drawLifeCell(lifeCtx, x, y);
            } else {
                clearLifeCell(lifeCtx, x, y);
            }
        }
    }
}

function drawLifeCell(ctx, x, y) {
    /* Draw the cell at position (x, y) */
    // Draw border rectangle
    ctx.fillStyle = LIFE_CELL_BORDER_COLOUR;
    ctx.fillRect(CELL_SIZE*x, CELL_SIZE*y, CELL_SIZE, CELL_SIZE);
    // Draw inside rectangle
    ctx.fillStyle = LIFE_CELL_FILL_COLOUR;
    ctx.fillRect((CELL_SIZE*x)+1, (CELL_SIZE*y)+1, CELL_SIZE-2, CELL_SIZE-2);
}

function clearLifeCell(ctx, x, y) {
    /* Clear the cell at position (x, y) */
    ctx.clearRect(CELL_SIZE*x, CELL_SIZE*y, CELL_SIZE, CELL_SIZE);
}

function makeGrid(x, y) {
    // Generate the game grid
    // Take in the size of the grid
    var gameGrid = new Array();

    for(var i = 0; i < x; ++i) {
        gameGrid[i] = new Array();
        for(var j = 0; j < y; ++j) {
            gameGrid[i][j] = {neighbours: 0, alive: false};
        }
    }
    return gameGrid;
}
