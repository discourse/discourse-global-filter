import { click, fillIn, visit } from "@ember/test-helpers";
import {
  acceptance,
  query,
  visible,
} from "discourse/tests/helpers/qunit-helpers";

import { test } from "qunit";
import { cloneJSON } from "discourse-common/lib/object";
import DiscoveryFixtures from "discourse/tests/fixtures/discovery-fixtures";

acceptance(
  "Discourse Global Filter - Require Tag on Topic Creation",
  function (needs) {
    needs.user({
      admin: true,
      custom_fields: { global_filter_preference: "support" },
    });
    needs.site({ filter_tags_total_topic_count: 0, can_tag_topics: true });
    needs.settings({
      discourse_global_filter_enabled: true,
      global_filters: "support|feature",
      tagging_enabled: true,
      default_composer_category: 1,
    });

    needs.pretender((server, helper) => {
      server.get("/tag/support/notifications", () =>
        helper.response({
          tag_notification: { id: "support", notification_level: 2 },
        })
      );

      server.get("/tag/support/l/latest.json", () => {
        const latest = cloneJSON(DiscoveryFixtures["/latest.json"]);
        latest.topic_list.can_create_topic = true;
        return helper.response(latest);
      });

      server.get(
        "/global_filter/filter_tags/categories_for_current_filter.json",
        () => {
          return helper.response({ success: true });
        }
      );

      server.get(
        "/global_filter/filter_tags/categories_for_filter_tags.json",
        () => {
          return helper.response({ success: true });
        }
      );
    });

    test("new topics require a global filter", async function (assert) {
      await visit("/");
      await click("#create-topic");
      await fillIn("#reply-title", "this is my new topic title");
      await fillIn(".d-editor-input", "this is the *content* of a post");

      assert.ok(
        query(".global-filter-composer-tag-support input:checked"),
        "global filter is selected by default"
      );

      await click(".global-filter-composer-tag-support input");

      await click("#reply-control button.create");

      assert.strictEqual(
        query(".dialog-body").innerText.trim(),
        "An application must be selected to create a topic.",
        "dialog is shown with message"
      );

      await click(".dialog-footer .btn-primary");
      await click(".global-filter-composer-tag-support input");
      await click("#reply-control button.create");

      assert.ok(
        !visible("#reply-control .d-editor-input"),
        "topic is submitted"
      );
    });

    test("new PMs work", async function (assert) {
      await visit("/u/charlie");
      await click(".compose-pm");

      await fillIn("#reply-title", "this is my new PM title");
      await fillIn(".d-editor-input", "this is the *content* of a post");
      await click("#reply-control button.create");

      assert.ok(!visible("#reply-control .d-editor-input"), "PM is submitted");
    });

    test("new replies work", async function (assert) {
      await visit("/t/internationalization-localization/280");
      await click(".reply.create");
      await fillIn(".d-editor-input", "this is the *content* of a reply");
      await click("#reply-control button.create");
      assert.ok(
        !visible("#reply-control .d-editor-input"),
        "reply is submitted"
      );
    });

    test("editing work", async function (assert) {
      await visit("/t/internationalization-localization/280");
      await click(".btn-flat.show-more-actions");
      await click(".btn-flat.edit");
      await fillIn(".d-editor-input", "this post has now been edited");
      await click("#reply-control button.create");

      assert.ok(
        !visible("#reply-control .d-editor-input"),
        "edit has been submitted"
      );
    });
  }
);
