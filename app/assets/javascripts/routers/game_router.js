SnakeGame.Routers.GameRouter = Backbone.Router.extend({
  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  routes: {
    "": "setUpGame",
    "start": "startGame",
  },

  setUpGame: function() {

  },

  startGame: function(options) {
    var specs = options || {players: 1, snakeSize: 2, maxX: 50, maxY: 50, speed: 100};
    var gameView = new SnakeGame.Views.Game(specs);
    this._swapView(gameView);
  },

  _swapView: function (view) {
    this._currentView && this._currentView.remove();
    this._currentView = view;
    this.$rootEl.html(view.render().$el);
  }
});
