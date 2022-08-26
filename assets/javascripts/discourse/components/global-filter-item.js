import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";

export default Component.extend({
  router: service(),
  classNames: ["global-filter-item"],

  @discourseComputed("filter")
  spacedTag(filter) {
    return filter.replace(/-|_/g, " ");
  },

  @action
  selectFilter(tag) {
    this.router.transitionTo(`/categories?tag=${tag}`);
  },
});
