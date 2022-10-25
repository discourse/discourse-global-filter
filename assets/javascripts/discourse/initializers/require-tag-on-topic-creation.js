import I18n from "I18n";
import { Promise } from "rsvp";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "require-tag-on-topic-creation",

  initialize() {
    withPluginApi("1.3.0", (api) => {
      api.composerBeforeSave(() => {
        return new Promise((resolve, reject) => {
          const composerModel = api.container.lookup(
            "controller:composer"
          ).model;
          const globalFilters = api.container
            .lookup("site-settings:main")
            .global_filters.split("|");

          if (
            composerModel.tags.filter((tag) => globalFilters.includes(tag))
              .length > 0
          ) {
            resolve();
          } else {
            const dialog = api.container.lookup("service:dialog");
            dialog.alert(
              I18n.t("global_filter.require_tag_on_topic_creation.error")
            );
            reject();
          }
        });
      });
    });
  },
};
