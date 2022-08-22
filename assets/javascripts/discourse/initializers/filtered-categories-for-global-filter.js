import { withPluginApi } from "discourse/lib/plugin-api";

const PLUGIN_ID = "discourse-global-filter";

export default {
  name: "filtered-categories-for-global-filter",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    if (siteSettings.discourse_global_filter_enabled) {
      withPluginApi("1.3.0", (api) => {
        api.modifyClass("controller:discovery/categories", {
          pluginId: PLUGIN_ID,
          queryParams: ["tag"],
        });
        api.modifyClass("route:discovery/categories", {
          pluginId: PLUGIN_ID,

          queryParams: {
            tag: {
              refreshModel: true,
            },
          },
        });
      });
    }
  },
};
