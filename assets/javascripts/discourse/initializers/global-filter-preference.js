import { next, run } from "@ember/runloop";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

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

    router.on("routeWillChange", (transition) => {
      const routeName = transition.to?.name;

      let tagFromNewTopic

      // on a /new-topic?tags=x route, determine if x is a globalFilter or a child of one
      if (routeName === "new-topic" && currentUser) {
        const tags = transition.to?.queryParams?.tags?.split(",");

        if (tags) {
          tagFromNewTopic = tags.find((tag) => globalFilters.includes(tag));

          if (!tagFromNewTopic) {
            const site = container.lookup("site:main");

            const globalFilterFromChildren = site.global_filters.find((globalFilter) => {
              return globalFilter.filter_children && Object.keys(globalFilter.filter_children).some((childTag) => tags.includes(childTag));
            })

            tagFromNewTopic = globalFilterFromChildren?.name
          }

          if (tagFromNewTopic) {
            this._setClientFilterPref(tagFromNewTopic, currentUser);
            return;
          }
        }
      }

      if (transition.queryParamsOnly) {
        return;
      }

      if (
        currentUser &&
        transition.to?.queryParams?.tag &&
        globalFilters.includes(transition.to.queryParams.tag)
      ) {
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
            filterPref = globalFilters.includes(filterPref)
              ? filterPref
              : globalFilters[0];
            this._redirectToFilterPref(
              transition,
              router,
              filterPref,
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
              transition.from?.queryParams?.tag ||
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
      // omit `tags` from redirects if passed from /new-topic, we're already enforcing a tag
      const { tags, ...queryParams} = transition?.to?.queryParams;
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
          next(() => router.transitionTo(`/categories?tag=${filterPref}`));
        } else if (transition.to?.name === "discovery.latest") {
          router.transitionTo("tag.show", filterPref, { queryParams });
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
    })
      .then(() => this._setClientFilterPref(tag, user))
      .catch(popupAjaxError);
  },

  _setClientFilterPref(tag, user) {
    return user.set("custom_fields.global_filter_preference", tag);
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
