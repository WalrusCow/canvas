requirejs.config({
  urlArgs: "ts="+new Date().getTime(),
  baseUrl : 'scripts',
  paths : { 'require' : '..' }
});

requirejs(['life', 'snake'], function(Life, Snake) {
  var snakePlay = document.getElementById('playSnake');
  snakePlay.addEventListener('click', Snake.play);

});
