import { visit } from "@ember/test-helpers";
import {
  acceptance,
  exists,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Filter Item", function (needs) {
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
  });

  needs.pretender((server, helper) => {
    ["support", "feature"].forEach((tag) => {
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

  test("adds active class to filter", async function (assert) {
    await visit("/tag/support");

    assert.ok(
      exists(
        ".global-filter-container #global-filter-support .global-filter-button.active"
      ),
      "item is active"
    );
  });
});
