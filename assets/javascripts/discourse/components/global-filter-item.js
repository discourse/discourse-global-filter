import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import DiscourseURL from "discourse/lib/url";

export default Component.extend({
  classNames: ["global-filter-item"],

  @discourseComputed("filter")
  spacedTag(filter) {
    return filter.replace(/-|_/g, " ");
  },

  @action
  selectFilter(tag) {
    DiscourseURL.routeTo(`/tag/${tag}`);
  },
});
