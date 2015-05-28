SnakeGame.Collections.SnakeScore = Backbone.Collection.extend({
  urlRoot: "/high_score/snake",
  getOrFetch: function(id) {
    var model = this.get(id);
    if(model) {
      return model;
    } else {
      model = new ShutterStep.Models.Picture({id: id});
      model.fetch();
    }
    return model;
  }
});
