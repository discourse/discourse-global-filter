import Site from "discourse/models/site";
import { debounce } from "discourse-common/utils/decorators";

export default {
  name: "apply-global-filter-styles",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const router = container.lookup("router:main");
    if (
      !siteSettings.discourse_global_filter_enabled ||
      !siteSettings.global_filters.length ||
      router.currentRouteName?.startsWith("admin")
    ) {
      return;
    }

    const globalFilters = siteSettings.global_filters.split("|");
    const currentUser = container.lookup("current-user:main");
    router.one("didTransition", () => {
      this._applyFilterStyles(router, globalFilters, currentUser, container);
    });
  },

  // we need a slight delay to allow for IDs to be applied to each global filter item
  // as we need to query against these ids and then apply styles. If we move too quickly
  // the global-filter-item ID will not exist and the correct styles won't be applied.
  @debounce(100)
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
        this._findGlobalFilterMatch(router, globalFilters);
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
};
