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
    const siteSettings = container.lookup("service:site-settings");
    if (
      !siteSettings.discourse_global_filter_enabled ||
      !siteSettings.global_filters.length
    ) {
      return;
    }

    const globalFilters = siteSettings.global_filters.split("|");
    const currentUser = container.lookup("service:current-user");
    // TODO: Use `router` service instead
    // eslint-disable-next-line ember/no-private-routing-service
    const router = container.lookup("router:main");

    router.on("routeWillChange", (transition) => {
      const routeName = transition.to?.name;
      if (routeName === "new-topic" && currentUser) {
        this.handleNewTopicRoute(
          transition,
          globalFilters,
          currentUser,
          container
        );
      }

      if (transition.queryParamsOnly) {
        return;
      }

      if (
        currentUser &&
        transition.to?.queryParams?.tag &&
        globalFilters.includes(transition.to.queryParams.tag)
      ) {
        this.handleTagFilterRoute(transition, currentUser);
      }

      if (ROUTES_TO_REDIRECT_ON.includes(routeName)) {
        this.handleRedirectRoute(
          transition,
          router,
          globalFilters,
          currentUser
        );
      }
    });
  },

  handleNewTopicRoute(transition, globalFilters, currentUser, container) {
    const tags = transition.to?.queryParams?.tags?.split(",");
    if (tags) {
      const tagFromNewTopic = tags.find((tag) => globalFilters.includes(tag));
      if (tagFromNewTopic) {
        this.setClientFilterPref(tagFromNewTopic, currentUser);
      } else {
        const site = container.lookup("service:site");
        const globalFilterFromChildren = site.global_filters.find(
          (globalFilter) => {
            return (
              globalFilter.filter_children &&
              Object.keys(globalFilter.filter_children).some((childTag) =>
                tags.includes(childTag)
              )
            );
          }
        );
        if (globalFilterFromChildren) {
          const tagFromChildren = globalFilterFromChildren.name;
          transition.to.queryParams.tags += `,${tagFromChildren}`;
          this.setClientFilterPref(tagFromChildren, currentUser);
        }
      }
    }
  },

  handleTagFilterRoute(transition, currentUser) {
    const tag = transition.to.queryParams.tag;
    this.setClientAndServerFilterPref(tag, currentUser);
  },

  handleRedirectRoute(transition, router, globalFilters, currentUser) {
    const additionalTags = transition.to?.params?.additional_tags;
    const tag =
      transition.to?.queryParams?.tag || transition.to?.params?.tag_id;
    const filterIncludesTag = globalFilters.includes(tag);
    let filterPref;
    let tagCombination;

    if (additionalTags && tag) {
      tagCombination = tag + "/" + additionalTags;
    }

    const includeAdditionalTags = filterIncludesTag
      ? additionalTags
      : tagCombination || additionalTags || tag;

    if (currentUser) {
      if (filterIncludesTag) {
        filterPref = this.setClientFilterPref(tag, currentUser);
      } else {
        filterPref = currentUser.custom_fields.global_filter_preference;
        filterPref = globalFilters.includes(filterPref)
          ? filterPref
          : globalFilters[0];
      }
      this.redirectToFilterPref(
        transition,
        router,
        filterPref,
        filterIncludesTag ? true : false,
        includeAdditionalTags
      );
    } else {
      if (filterIncludesTag) {
        filterPref = tag;
      } else {
        filterPref =
          transition.from?.params?.tag_id ||
          transition.from?.queryParams?.tag ||
          this.firstGlobalFilterFromParent(router, globalFilters) ||
          globalFilters[0];
      }
      this.redirectToFilterPref(
        transition,
        router,
        filterPref,
        filterIncludesTag ? true : false,
        includeAdditionalTags
      );
    }
  },

  redirectToFilterPref(
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

  setClientAndServerFilterPref(tag, user) {
    return ajax(`/global_filter/filter_tags/${tag}/assign.json`, {
      type: "PUT",
    })
      .then(() => this.setClientFilterPref(tag, user))
      .catch(popupAjaxError);
  },

  setClientFilterPref(tag, user) {
    return user.set("custom_fields.global_filter_preference", tag);
  },

  firstGlobalFilterFromParent(router, globalFilters) {
    const tags =
      router.currentRoute?.parent?.attributes?.tags?.find((tag) =>
        globalFilters.includes(tag)
      ) || null;
    return tags;
  },
};
