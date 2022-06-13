import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";

export default Component.extend({
  router: service(),
  classNames: ["global-filter-item"],

  @action
  selectFilter(tag) {
    this._filterTopicsByTag(tag);
  },

  @discourseComputed("siteSettings.global_filters")
  globalFilters() {
    return this.siteSettings.global_filters.split("|");
  },

  _filterTopicsByTag(tag) {
    this.router.transitionTo("tag.show", tag);
  },
});
