import DiscourseRoute from "discourse/routes/discourse";
import { ajax } from "discourse/lib/ajax";
import EmberObject from "@ember/object";

export default DiscourseRoute.extend({
  model() {
    return ajax("/global_filter/filter_tags.json").then((model) => {
      model.filter_tags = model.filter_tags.map((filter_tag) =>
        EmberObject.create(filter_tag)
      );
      return model;
    });
  },
});
