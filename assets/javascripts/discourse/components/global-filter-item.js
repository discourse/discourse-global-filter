import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Component.extend({
  router: service(),
  classNames: ["global-filter-item"],

  @discourseComputed("siteSettings.global_filters")
  globalFilters() {
    return this.siteSettings.global_filters.split("|");
  },

  @discourseComputed("currentUser.custom_fields.global_filter_preference")
  highlightActive(tagPreference) {
    if (this.filter === tagPreference) {
      return "active";
    }
  },

  @action
  selectFilter(tag) {
    this._filterTopicsByTag(tag);
    this._persistTagToServer(tag);
  },

  _filterTopicsByTag(tag) {
    this.router.transitionTo("tag.show", tag);
  },

  _persistTagToServer(tag) {
    const user = this.currentUser;
    if (!user.id || user.custom_fields.global_filter_preference === tag) {
      return;
    }

    ajax(`/global_filter/filter_tags/${tag}/assign.json`, {
      type: "PUT",
      data: { user_id: user.id },
    })
      .then(() => {
        this._setUserTagPreference(tag);
      })
      .catch(popupAjaxError);
  },

  _setUserTagPreference(tag) {
    this.set("currentUser.custom_fields.global_filter_preference", tag);
  },
});
