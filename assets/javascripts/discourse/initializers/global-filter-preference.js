import { run } from "@ember/runloop";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

const ROUTES_TO_REDIRECT_ON = [
  "discovery.latest",
  "discovery.top",
  "discovery.unread",
  "discovery.category",
  "tag.show",
  "tags.intersection",
  "tags.showCategory",
];

export default {
  name: "global-filter-preference",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (!siteSettings.discourse_global_filter_enabled) {
      return;
    }

    const globalFilters = siteSettings.global_filters.split("|");
    const currentUser = container.lookup("current-user:main");
    const router = container.lookup("router:main");

    router.on("didTransition", () => {
      applyFilterStyles(router, globalFilters);
    });

    router.on("routeWillChange", (transition) => {
      if (transition.queryParamsOnly) {
        return;
      }

      const routeName = transition.to?.name;

      if (ROUTES_TO_REDIRECT_ON.includes(routeName)) {
        const additionalTags = transition.to?.params?.additional_tags;
        const tag = transition.to?.params?.tag_id;
        let filterPref;
        let tagCombination;

        if (additionalTags && tag) {
          tagCombination = additionalTags + `\${tag}`;
        }

        if (currentUser) {
          if (globalFilters.includes(tag)) {
            this._setClientAndServerFilterPref(tag, currentUser).then(() => {
              filterPref = this._setClientFilterPref(tag, currentUser);
              this._redirectToFilterPref(
                transition,
                router,
                filterPref,
                true,
                additionalTags || false
              );
            });
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
            filterPref = globalFilters[0];
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

      // if the route is tag.show but we won't be redirecting to a
      // tag intersection or a category, just return
      if (
        transition.to?.name === "tag.show" &&
        !(additionalTags || categorySlug)
      ) {
        return;
      }

      if (!globalFilterPresent || transition.to?.name === "tag.show") {
        if (additionalTags) {
          url = `/tags/intersection/${filterPref}/${additionalTags}`;
        } else {
          const categoryURL = categorySlug ? `s/c/${categorySlug}` : "";
          url = `/tag${categoryURL}/${filterPref}`;
        }

        router.transitionTo(url, null, { queryParams });
      } else if (
        ROUTES_TO_REDIRECT_ON.includes(transition.intent?.targetName)
      ) {
        router.transitionTo(
          `/tag/${filterPref}/l/${transition.to.localName}`,
          null,
          { queryParams }
        );
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
};

function applyFilterStyles(router, globalFilters) {
  const filter = router.currentRoute.params?.tag_id;
  const filterBodyClass = `global-filter-tag-${filter}`;
  globalFilters.forEach((item) => {
    if (item === filter) {
      document.getElementById(`global-filter-${item}`).classList.add("active");
      document.body.classList.add(filterBodyClass);
      return;
    }

    document.getElementById(`global-filter-${item}`).classList.remove("active");
    document.body.classList.remove(filterBodyClass);
  });
}
