import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance("Discourse Global Filter - Context", function (needs) {
  needs.user({ custom_fields: { global_filter_preference: "support" } });
  needs.site({
    filter_tags_total_topic_count: { support: 1, feature: 1 },
    global_filters: [
      { id: 1, name: "support" },
      { id: 2, name: "feature" },
    ],
  });
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
  });

  needs.pretender((server, helper) => {
    server.get("/tag/support/notifications", () =>
      helper.response({
        tag_notification: { id: "support", notification_level: 2 },
      })
    );

    server.get("/tag/support/l/latest.json", () => {
      return helper.response({
        users: [],
        primary_groups: [],
        topic_list: {
          can_create_topic: true,
          draft: null,
          draft_key: "new_topic",
          draft_sequence: 1,
          per_page: 30,
          tags: [],
          topics: [],
        },
      });
    });

    server.get(
      "/global_filter/filter_tags/categories_for_current_filter.json",
      () => {
        return helper.response({ success: true });
      }
    );
  });

  test("sets global filter from a 'tags' query param", async function (assert) {
    await visit("/latest?tags=support");
    assert.ok(
      document.body.classList.contains("global-filter-tag-support"),
      "it contains the right body class"
    );
  });
});
