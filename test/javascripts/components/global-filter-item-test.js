import { click, visit } from "@ember/test-helpers";
import {
  acceptance,
  exists,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Filter Item", function (needs) {
  needs.user();
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
  });

  needs.pretender((server, helper) => {
    ["support", "feature"].forEach((tag) => {
      server.get(`/tag/${tag}/notifications`, () => {
        return helper.response({
          tag_notification: { id: tag, notification_level: 2 },
        });
      });

      server.get(`/tag/${tag}/l/latest.json`, () => {
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

      server.put(`/global_filter/filter_tags/${tag}/assign.json`, () => {
        return helper.response({ success: true });
      });
    });
  });

  test("is present when included in global_filters", async function (assert) {
    await visit("/");
    let tags = [];
    queryAll(".global-filter-container .global-filter-item").each((_, el) =>
      tags.push(el.innerText.trim())
    );
    assert.deepEqual(tags, this.siteSettings.global_filters.split("|"));
  });

  test("adds active class to filter when selected", async function (assert) {
    await visit("/");
    await click(
      ".global-filter-container #global-filter-feature .global-filter-button"
    );

    assert.ok(
      exists(
        ".global-filter-container #global-filter-feature .global-filter-button.active"
      ),
      "item is active"
    );
  });
});
