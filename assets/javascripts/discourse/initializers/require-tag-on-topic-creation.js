import I18n from "I18n";
import { Promise } from "rsvp";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "require-tag-on-topic-creation",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    if (siteSettings.discourse_global_filter_enabled) {
      withPluginApi("1.3.0", (api) => {
        api.composerBeforeSave(() => {
          return new Promise((resolve, reject) => {
            const composerModel = api.container.lookup(
              "controller:composer"
            ).model;

            // only require tags when creating a regular topic
            // i.e. skip validation for PMs, replies, edits, etc.
            if (
              composerModel.action !== "createTopic" ||
              composerModel.archetypeId !== "regular"
            ) {
              return resolve();
            }
            const globalFilters = api.container
              .lookup("site-settings:main")
              .global_filters.split("|");

            if (
              composerModel.tags.filter((tag) => globalFilters.includes(tag))
                .length > 0
            ) {
              return resolve();
            } else {
              const dialog = api.container.lookup("service:dialog");
              dialog.alert(
                I18n.t("global_filter.require_tag_on_topic_creation.error")
              );
              return reject();
            }
          });
        });
      });
    }
  },
};
