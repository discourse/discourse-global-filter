import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import DiscourseURL from "discourse/lib/url";

export default Component.extend({
  classNames: ["global-filter-item"],

  @discourseComputed("currentUser.custom_fields.global_filter_preference")
  highlightActive(tagPreference) {
    if (this.filter === tagPreference) {
      return "active";
    }
  },

  @action
  selectFilter(tag) {
    DiscourseURL.routeTo(`/tag/${tag}`);
  },
});
