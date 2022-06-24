import DiscourseURL, { getCategoryAndTagUrl } from "discourse/lib/url";

export default {
  name: "global-filter-preference",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const currentUser = container.lookup("current-user:main");
    let userGlobalFilterPref =
      currentUser?.custom_fields?.global_filter_preference;

    if (
      !siteSettings.discourse_global_filter_enabled ||
      !userGlobalFilterPref
    ) {
      return;
    }

    const router = container.lookup("router:main");
    const routesToRedirectOn = siteSettings.top_menu.split("|");
    routesToRedirectOn.push("/");

    router.on("routeDidChange", () => {
      if (routesToRedirectOn.includes(router.currentRoute.localName)) {
        // grab the global_filter_preference in case it was updated
        userGlobalFilterPref =
          currentUser.custom_fields.global_filter_preference;

        let url = "";

        url = getCategoryAndTagUrl(
          this.currentCategory,
          !this.noSubcategories,
          userGlobalFilterPref
        );

        if (router.currentURL !== "/") {
          url += `/l/${router.currentRoute.localName}`;
        }

        if (router.currentRoute.queryParams) {
          const params = router.currentURL.split("?");
          url += `?${params[1]}`;
        }

        DiscourseURL.routeTo(url);
      }
    });
  },
};
