requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
  paths : { 'require' : '/lib/requirejs' }
});

requirejs(['snake'], function(SnakeGame) {
  var snakeGame = new SnakeGame();
});
