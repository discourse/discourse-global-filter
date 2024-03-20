import Site from "discourse/models/site";

export default {
  name: "apply-global-filter",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    const router = container.lookup("service:router");
    if (
      !siteSettings.discourse_global_filter_enabled ||
      !siteSettings.global_filters.length ||
      router.currentRouteName?.startsWith("admin")
    ) {
      return;
    }

    const globalFilters = siteSettings.global_filters.split("|");
    const currentUser = container.lookup("service:current-user");
    router.one("routeDidChange", () => {
      this._applyGlobalFilter(router, globalFilters, currentUser, container);
    });
  },

  _applyGlobalFilter(router, globalFilters, currentUser, container) {
    // if there is not a filter pref for the current user, tag_id or tag in the params
    // select the first tag from the parent that matches a global filter
    let tags;
    const filterPref = currentUser?.custom_fields?.global_filter_preference;
    const topic = container.lookup("controller:topic");
    const topicTags = topic.model?.tags;
    if (topicTags && topicTags.includes(filterPref)) {
      tags = filterPref;
    } else {
      tags =
        router.currentRoute?.params?.tag_id ||
        router.currentRoute?.queryParams?.tag ||
        this._findGlobalFilterMatch(router, globalFilters);
    }

    if (!tags) {
      return this._setSiteGlobalFilter(filterPref ?? globalFilters[0]);
    }

    globalFilters.forEach((item) => {
      if (item === tags) {
        return this._setSiteGlobalFilter(item);
      }
    });
  },

  _findGlobalFilterMatch(router, globalFilters) {
    // handles parent route attributes
    // and docs query parameters
    let tags =
      router.currentRoute?.parent?.attributes?.tags ||
      router.currentRoute?.queryParams?.tags?.split("|") ||
      null;
    if (tags) {
      tags = tags.filter((tag) => globalFilters.includes(tag));
      tags = tags[0];
    }

    return tags;
  },

  _setSiteGlobalFilter(filter) {
    Site.current().set("globalFilter", filter);
  },
};
