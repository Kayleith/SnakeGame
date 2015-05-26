SnakeGame.Routers.GameRouter = Backbone.Router.extend({
  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  routes: {
    "setupSnake": "setUpSnakeGame",
    "startSnake": "startGame",
  },

  setUpSnakeGame: function() {

  },

  startGame: function(options) {
    var specs = options || {players: 1, maxX: 30, maxY: 30, speed: 100};
    var gameView = new SnakeGame.Views.Game(specs);
    this._swapView(gameView);
  },

  _swapView: function (view) {
    this._currentView && this._currentView.remove();
    this._currentView = view;
    this.$rootEl.html(view.render().$el);
  }
});
