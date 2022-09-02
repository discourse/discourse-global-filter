import { next, run } from "@ember/runloop";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { withPluginApi } from "discourse/lib/plugin-api";

const ROUTES_TO_REDIRECT_ON = [
  "discovery.latest",
  "discovery.top",
  "discovery.unread",
  "discovery.category",
  "discovery.categories",
  "tag.show",
  "tags.intersection",
];

export default {
  name: "global-filter-preference",

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

    router.on("routeDidChange", () => {
      next(() => this._applyFilterStyles(router, globalFilters));
    });

    // set expectation of us updating category chooser content
    withPluginApi("1.3.0", (api) => setFilteredCategoriesForGlobalFilter(api));

    router.on("routeWillChange", (transition) => {
      const routeName = transition.to?.name;

      // set the custom category options per global filter
      if (routeName === "discovery.categories") {
        ajax(
          "/global_filter/filter_tags/categories_for_global_filter.json"
        ).then((model) => {
          categoryDropdown = model.categories;
        });
      }

      if (transition.queryParamsOnly) {
        return;
      }

      if (currentUser && transition.to?.queryParams?.tag) {
        this._setClientAndServerFilterPref(
          transition.to.queryParams.tag,
          currentUser
        );
      }

      if (ROUTES_TO_REDIRECT_ON.includes(routeName)) {
        const additionalTags = transition.to?.params?.additional_tags;
        const tag =
          transition.to?.queryParams?.tag || transition.to?.params?.tag_id;

        let filterPref;
        let tagCombination;

        if (additionalTags && tag) {
          tagCombination = tag + "/" + additionalTags;
        }

        if (currentUser) {
          if (globalFilters.includes(tag)) {
            filterPref = this._setClientFilterPref(tag, currentUser);
            this._redirectToFilterPref(
              transition,
              router,
              filterPref,
              true,
              additionalTags || false
            );
          } else {
            filterPref = currentUser.custom_fields.global_filter_preference;
            this._redirectToFilterPref(
              transition,
              router,
              filterPref || globalFilters[0],
              false,
              tagCombination || additionalTags || tag || false
            );
          }
        } else {
          if (globalFilters.includes(tag)) {
            filterPref = tag;
            this._redirectToFilterPref(
              transition,
              router,
              filterPref,
              true,
              additionalTags || false
            );
          } else {
            filterPref =
              transition.from?.params?.tag_id ||
              this._firstGlobalFilterFromParent(router, globalFilters) ||
              globalFilters[0];
            this._redirectToFilterPref(
              transition,
              router,
              filterPref,
              false,
              tagCombination || additionalTags || tag || false
            );
          }
        }
      }
    });
  },

  _redirectToFilterPref(
    transition,
    router,
    filterPref,
    globalFilterPresent = true,
    additionalTags = false
  ) {
    let url;
    run(router, function () {
      const queryParams = transition?.to?.queryParams;
      const categorySlug = transition.to?.params?.category_slug_path_with_id;

      if (
        transition.to?.name === "tag.show" &&
        !(additionalTags || categorySlug)
      ) {
        return;
      }

      if (!globalFilterPresent || transition.to?.name === "tag.show") {
        if (additionalTags) {
          url = `/tags/intersection/${filterPref}/${additionalTags}`;
          router.transitionTo(url, null, { queryParams });
        } else if (transition.to?.localName === "categories") {
          transition.abort();
          router.transitionTo(`/categories?tag=${filterPref}`);
        } else if (transition.to?.name === "discovery.latest") {
          router.transitionTo(`/tag/${filterPref}`, null, { queryParams });
        } else {
          const categoryURL = categorySlug ? `s/c/${categorySlug}` : "";
          url = `/tag${categoryURL}/${filterPref}`;
          router.transitionTo(url, null, { queryParams });
        }
      }
    });
  },

  _setClientAndServerFilterPref(tag, user) {
    return ajax(`/global_filter/filter_tags/${tag}/assign.json`, {
      type: "PUT",
      data: { user_id: user.id },
    })
      .then(() => this._setClientFilterPref(tag, user))
      .catch(popupAjaxError);
  },

  _setClientFilterPref(tag, user) {
    return user.set("custom_fields.global_filter_preference", tag);
  },

  _applyFilterStyles(router, globalFilters) {
    // if there is not a tag_id or tag in the params
    // select the first tag from the parent that matches a global filter
    let tags =
      router.currentRoute.params?.tag_id ||
      router.currentRoute.queryParams?.tag ||
      this._firstGlobalFilterFromParent(router, globalFilters);

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

let categoryDropdown = [];
function setFilteredCategoriesForGlobalFilter(api) {
  api.modifySelectKit("category-drop").appendContent(() => {
    return categoryDropdown;
  });
}
