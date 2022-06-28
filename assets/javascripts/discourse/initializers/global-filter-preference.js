import { run } from "@ember/runloop";

export default {
  name: "global-filter-preference",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const currentUser = container.lookup("current-user:main");
    const userGlobalFilterPref =
      currentUser?.custom_fields?.global_filter_preference;

    if (
      !siteSettings.discourse_global_filter_enabled ||
      !userGlobalFilterPref
    ) {
      return;
    }

    const router = container.lookup("router:main");
    router.on("routeWillChange", (transition) => {
      const routesToRedirectOn = siteSettings.top_menu.split("|");
      const localName = transition.to?.localName;

      if (localName && routesToRedirectOn.includes(localName)) {
        run(router, function () {
          return router.replaceWith(
            `/tag/${userGlobalFilterPref}/l/${localName}`,
            {
              queryParams: transition.to.queryParams,
            }
          );
        });
      }
    });
  },
};
