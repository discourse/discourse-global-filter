import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  router: service(),

  @discourseComputed("siteSettings.global_filters", "router.currentRouteName")
  globalFilters(filters, routeName) {
    if (!filters || routeName.startsWith("admin")) {
      return false;
    }
    return filters.split("|");
  },
});
