SnakeGame.Views.SpaceInvaders = Backbone.CompositeView.extend({
  template: JST["spaceInvader"],

  render: function() {
    var content = this.template();
    this.$el.html(content);
    return this;
  },


});
