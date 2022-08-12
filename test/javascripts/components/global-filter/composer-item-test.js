import { click, visit } from "@ember/test-helpers";
import {
  acceptance,
  query,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Composer Item", function (needs) {
  needs.user();
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
  });
  needs.site({ can_tag_topics: true });

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

    server.put("/global_filter/filter_tags/support/assign.json", () => {
      return helper.response({ success: true });
    });
  });

  test("is present when included in global_filters", async function (assert) {
    await visit("/");
    await click("#create-topic");
    let tags = [];
    queryAll(
      ".global-filter-composer-container .global-filter-composer-item"
    ).each((_, el) => tags.push(el.innerText.trim()));
    assert.deepEqual(tags, this.siteSettings.global_filters.split("|"));
  });

  test("item is checked by default when creating topic in global-filter tag route", async function (assert) {
    await visit("/tag/support");
    await click("#create-topic");

    assert.strictEqual(
      query(".global-filter-composer-tag-support input").checked,
      true,
      "item is checked"
    );
  });
});
