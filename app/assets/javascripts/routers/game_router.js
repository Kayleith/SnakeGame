SnakeGame.Routers.GameRouter = Backbone.Router.extend({
  initialize: function(options) {
    this.$rootEl = options.$rootEl;
  },

  routes: {
    "snake": "snake",
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
