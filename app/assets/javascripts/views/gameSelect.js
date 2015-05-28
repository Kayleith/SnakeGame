SnakeGame.Views.GameSelect = Backbone.CompositeView.extend({
  template: JST["gameSelect"],

  render: function() {
    var content = this.template();
    this.$el.html(content);
    return this;
  }
});
