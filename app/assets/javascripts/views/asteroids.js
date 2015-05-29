SnakeGame.Views.Asteroids = Backbone.CompositeView.extend({
  template: JST["asteroids"],

  render: function() {
    var content = this.template();
    this.$el.html(content);
    return this;
  }
});
