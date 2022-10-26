import { visit } from "@ember/test-helpers";
import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Filter Container", function (needs) {
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support",
  });
  needs.site({ filter_tags_total_topic_count: 0 });
  needs.user({ custom_fields: { global_filter_preference: "support" } });

  needs.pretender((server, helper) => {
    server.get("/tag/support/notifications", () =>
      helper.response({
        tag_notification: { id: "support", notification_level: 2 },
      })
    );

    server.get(
      "/global_filter/filter_tags/categories_for_current_filter.json",
      () => helper.response({ categories: [], subcategories: [] })
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

    server.put("/global_filter/filter_tags/support/assign.json", () => {
      return helper.response({ success: true });
    });
  });

  test("is present when a tag is included in global_filters", async function (assert) {
    await visit("/");
    assert.ok(exists(".global-filter-container"), "container is present");
  });
});
