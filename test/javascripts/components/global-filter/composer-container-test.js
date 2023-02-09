import { click, visit } from "@ember/test-helpers";
import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Composer Container", function (needs) {
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support",
  });
  needs.user({ custom_fields: { global_filter_preference: "support" } });
  needs.site({
    filter_tags_total_topic_count: { support: 1 },
    global_filters: [{ id: 1, name: "support" }],
  });

  needs.pretender((server, helper) => {
    server.get(
      "/global_filter/filter_tags/categories_for_current_filter.json",
      () => {
        return helper.response({ categories: [] });
      }
    );

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

  test("is present when a tag is included in global_filters", async function (assert) {
    await visit("/tag/support");
    await click("#create-topic");
    assert.ok(
      exists(".global-filter-composer-container"),
      "composer container is present"
    );
  });

  test("is present when editing the first post of a topic", async function (assert) {
    await visit("/t/internationalization-localization/280");
    await click(".btn-flat.show-more-actions");
    await click(".btn-flat.edit");

    assert.ok(
      exists(".global-filter-composer-container"),
      "composer container is present"
    );
  });

  test("is not present when creating a PM", async function (assert) {
    await visit("/u/charlie");
    await click(".compose-pm");

    assert.notOk(
      exists(".global-filter-composer-container"),
      "composer container is not present"
    );
  });

  test("is not present when editing a PM", async function (assert) {
    await visit("/t/test-pm/34");
    await click(".btn-flat.show-more-actions");
    await click(".btn-flat.edit");

    assert.notOk(
      exists(".global-filter-composer-container"),
      "composer container is not present"
    );
  });
});
