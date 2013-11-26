requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
  baseUrl : 'scripts',
  paths : { 'require' : '..' }
});

requirejs(['life', 'snake'], function(Life, SnakeGame) {

  // Initialize life!
  var lifeGame = new Life();

  var snakeGame = new SnakeGame();

});
