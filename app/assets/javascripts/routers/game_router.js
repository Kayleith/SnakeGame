SnakeGame.Routers.GameRouter = Backbone.Router.extend({
  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  routes: {
    "": "gameSelect",
    "snake": "snake",
    "asteroids": "asteroids",
    "spaceinvaders": "spaceinvaders"

  },

  gameSelect: function() {
    var gameSelect = new SnakeGame.Views.GameSelect();
    this._swapView(gameSelect);
  },

  spaceinvaders: function() {
    var gameView = new SnakeGame.Views.SpaceInvaders();
    this._swapView(gameView);
  },

  asteroids: function() {
    var gameView = new SnakeGame.Views.Asteroids();
    this._swapView(gameView);
  },

  snake: function() {
    var gameView = new SnakeGame.Views.SnakeGame();
    this._swapView(gameView);
  },

  _swapView: function (view) {
    this._currentView && this._currentView.remove();
    this._currentView = view;
    this.$rootEl.html(view.render().$el);
  }
});
