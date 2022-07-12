import Component from "@ember/component";
import { action } from "@ember/object";
import DiscourseURL from "discourse/lib/url";

export default Component.extend({
  classNames: ["global-filter-item"],

  @action
  selectFilter(tag) {
    DiscourseURL.routeTo(`/tag/${tag}`);
  },
});
