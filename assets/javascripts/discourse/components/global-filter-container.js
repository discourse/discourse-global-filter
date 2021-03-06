import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";

export default Component.extend({
  classNames: ["global-filter-container"],

  @discourseComputed("siteSettings.global_filters")
  globalFilters(filters) {
    if (!filters) {
      return false;
    }
    return filters.split("|");
  },
});
