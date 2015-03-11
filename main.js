requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
});

requirejs(['snake'], function(SnakeGame) {
  var snakeGame = new SnakeGame();
});
