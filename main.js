requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
});
requirejs(['snake'], function(SnakeGame) {
  var snakeGame = new SnakeGame();
  snakeGame.on('snake:length:change', function (snake, length) {
    document.getElementById('Snake-score').innerHTML = (
      'length: &nbsp;' + length
    );
  });
});
