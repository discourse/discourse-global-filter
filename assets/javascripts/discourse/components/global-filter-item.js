import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { defaultHomepage } from "discourse/lib/utilities";

export default Component.extend({
  router: service(),
  classNames: ["global-filter-item"],

  @discourseComputed("filter")
  spacedTag(filter) {
    return filter.replace(/-|_/g, " ");
  },

  @action
  selectFilter(tag) {
    if (defaultHomepage() === "categories") {
      this.router.transitionTo(`/categories?tag=${tag}`);
    } else {
      this.router.transitionTo(`/tag/${tag}`);
    }
  },
});
