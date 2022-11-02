import { next } from "@ember/runloop";
import Site from "discourse/models/site";

export default {
  name: "apply-global-filter-styles",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (
      !siteSettings.discourse_global_filter_enabled ||
      !siteSettings.global_filters.length
    ) {
      return;
    }

    const globalFilters = siteSettings.global_filters.split("|");
    const currentUser = container.lookup("current-user:main");
    const router = container.lookup("router:main");
    next(() =>
      this._applyFilterStyles(router, globalFilters, currentUser, container)
    );
  },

  _applyFilterStyles(router, globalFilters, currentUser, container) {
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
        this._firstGlobalFilterFromParent(router, globalFilters);
    }

    if (!tags) {
      return;
    }

    globalFilters.forEach((item) => {
      const filterBodyClass = `global-filter-tag-${item}`;

      if (item === tags) {
        document
          .querySelector(`#global-filter-${item} > a`)
          .classList.add("active");
        document.body.classList.add(filterBodyClass);
        Site.current().set("globalFilter", item);
        return;
      }

      document
        .querySelector(`#global-filter-${item} > a`)
        .classList.remove("active");
      document.body.classList.remove(filterBodyClass);
    });
  },

  _firstGlobalFilterFromParent(router, globalFilters) {
    let tags = router.currentRoute?.parent?.attributes?.tags || null;
    if (tags) {
      tags = tags.filter((tag) => globalFilters.includes(tag));
      tags = tags[0];
    }
    return tags;
  },
};
