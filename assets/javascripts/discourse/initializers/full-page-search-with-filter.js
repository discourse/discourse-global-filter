import { withPluginApi } from "discourse/lib/plugin-api";

const PLUGIN_ID = "discourse-global-filter";

export default {
  name: "full-page-search-with-filter",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    if (siteSettings.discourse_global_filter_enabled) {
      withPluginApi("1.3.0", (api) => {
        api.modifyClass("controller:full-page-search", {
          pluginId: PLUGIN_ID,

          init() {
            this._super(...arguments);
            const filterPref =
              this.currentUser?.custom_fields?.global_filter_preference ||
              siteSettings.global_filters.split("|")[0];
            this.set("q", `tags:${filterPref}`);
          },
        });
      });
    }
  },
};
