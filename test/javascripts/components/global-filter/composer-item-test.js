import { click, settled, visit } from "@ember/test-helpers";
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
  needs.site({ can_tag_topics: true, filter_tags_total_topic_count: 0 });

  needs.pretender((server, helper) => {
    ["support", "feature"].forEach((tag) => {
      server.get(
        `/global_filter/filter_tags/categories_for_filter_tags.json`,
        () => {
          return helper.response({ success: true });
        }
      );

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

    server.get(
      "/global_filter/filter_tags/categories_for_current_filter.json",
      () => {
        return helper.response({ categories: [] });
      }
    );
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

  test("toggling filter items removes/adds correct tags", async function (assert) {
    await visit("/");
    await settled();
    await click("#create-topic");
    await settled();

    assert.strictEqual(
      query(".global-filter-composer-tag-support input").checked,
      true,
      "support filter is checked by default"
    );
    // uncheck support filter
    await click(".global-filter-composer-tag-support input");
    await settled();
    // check feature filter
    await click(".global-filter-composer-tag-feature input");
    await settled();

    let composer = this.owner.lookup("controller:composer");
    assert.ok(
      composer.get("model").tags,
      ["feature"],
      "expected filter is present"
    );
  });
});
