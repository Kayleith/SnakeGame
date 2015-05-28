SnakeGame.Collections.SnakeScores = Backbone.Collection.extend({
  url: "/high_scores/snake",
  model: SnakeGame.Models.SnakeScore,

  getOrFetch: function(id) {
    var model = this.get(id);
    if(model) {
      return model;
    } else {
      model = new ShutterStep.Models.Picture({id: id});
      model.fetch();
    }
    return model;
  },

  comparator: function(model) {
    return -(model.get("score"));
  }
});
