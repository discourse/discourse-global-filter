import DiscourseRoute from "discourse/routes/discourse";
import EmberObject from "@ember/object";
import { ajax } from "discourse/lib/ajax";

export default DiscourseRoute.extend({
  model() {
    return ajax("/admin/plugins/filter_tags.json").then((model) => {
      model.filter_tags = model.filter_tags.map((filter_tag) =>
        EmberObject.create(filter_tag)
      );
      return model;
    });
  },
});
