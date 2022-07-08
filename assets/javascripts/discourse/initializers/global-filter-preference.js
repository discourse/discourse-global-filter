import { run } from "@ember/runloop";
import { Promise } from "rsvp";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

const ROUTES_TO_REDIRECT_ON = [
  "discovery.latest",
  "discovery.top",
  "discovery.unread",
];

export default {
  name: "global-filter-preference",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const currentUser = container.lookup("current-user:main");
    if (!siteSettings.discourse_global_filter_enabled || !currentUser) {
      return;
    }
    const router = container.lookup("router:main");

    router.on("routeWillChange", (transition) => {
      const globalFilters = siteSettings.global_filters.split("|");
      const tag = transition.to?.params?.tag_id;
      let userGlobalFilterPref =
        currentUser.custom_fields?.global_filter_preference;

      if (
        tag &&
        globalFilters.includes(tag) &&
        (!userGlobalFilterPref || userGlobalFilterPref !== tag)
      ) {
        new Promise((resolve) =>
          resolve(
            this._setClientAndServerTagPref(tag, currentUser, globalFilters)
          )
        ).then(() => {
          return this._redirectToFilterPref(
            transition,
            router,
            userGlobalFilterPref
          );
        });
      }

      this._updateBodyFilterClass(userGlobalFilterPref, globalFilters);
      return this._redirectToFilterPref(
        transition,
        router,
        userGlobalFilterPref
      );
    });
  },

  _redirectToFilterPref(transition, router, filterPref) {
    const routeName = transition.to?.name;

    if (filterPref && routeName && ROUTES_TO_REDIRECT_ON.includes(routeName)) {
      run(router, function () {
        return router.replaceWith(
          `/tag/${filterPref}/l/${transition.to?.localName}`,
          {
            queryParams: transition.to.queryParams,
          }
        );
      });
    }
  },

  _setClientAndServerTagPref(tag, user, globalFilters) {
    ajax(`/global_filter/filter_tags/${tag}/assign.json`, {
      type: "PUT",
      data: { user_id: user.id },
    })
      .then(() => {
        const filter = this._setClientUserTagPreference(tag, user);
        this._updateBodyFilterClass(filter, globalFilters);
      })
      .catch(popupAjaxError);
  },

  _setClientUserTagPreference(tag, user) {
    return user.set("custom_fields.global_filter_preference", tag);
  },

  _updateBodyFilterClass(filter, globalFilters = []) {
    globalFilters.filter((arg) => this._addOrRemoveFilterClass(arg, filter));
  },

  _addOrRemoveFilterClass(filter, globalFilter) {
    const filterClass = `global-filter-tag-${filter}`;
    if (filter === globalFilter) {
      return document.body.classList.add(filterClass);
    }

    document.body.classList.remove(filterClass);
  },
};
