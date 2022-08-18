import { click, currentURL, visit } from "@ember/test-helpers";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance(
  "Discourse Global Filter - Filter Preference Initializer",
  function (needs) {
    needs.user({ custom_fields: { global_filter_preference: "support" } });
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

      server.get("/tags/intersection/support/blog.json", () => {
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

      server.get("/tag/support/l/top.json", () => {
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

      server.get("/tag/blog/l/latest.json", () => {
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

    test("redirects to tag when selected", async function (assert) {
      await visit("/");
      await click(".global-filter-container #global-filter-support button");

      assert.equal(
        currentURL(),
        "/tag/support",
        "it redirects to the right tag"
      );
    });

    test("maintains tag filter when redirecting to a filtered topic view", async function (assert) {
      await visit("/");
      await click("#navigation-bar .nav-item_top a");

      assert.equal(
        currentURL(),
        "/tag/support/l/top",
        "it redirects to the user's global_filter_preference"
      );
    });

    test("maintains tag filter when redirecting to root URL", async function (assert) {
      await visit("/");

      assert.equal(
        currentURL(),
        "/tag/support",
        "it redirects to the user's global_filter_preference"
      );
    });

    test("maintains params when redirecting", async function (assert) {
      await visit("/latest?f=tracked");

      assert.equal(
        currentURL(),
        "/tag/support?f=tracked",
        "it redirects to the user's global_filter_preference"
      );
    });

    test("adds global-filter css class to body", async function (assert) {
      await visit("/");
      assert.ok(
        document
          .querySelector("body")
          .classList.contains("global-filter-tag-support"),
        "includes users filter preference class on the body"
      );
    });

    test("doesn't store tag as preference if not included in global_filters", async function (assert) {
      const currentUser = this.container.lookup("current-user:main");
      await visit("/tag/blog");

      assert.equal(
        currentUser.custom_fields.global_filter_preference,
        "support",
        "it does not update the users global_filter_preference"
      );
    });

    test("creates an intersection for non global-filter tags", async function (assert) {
      await visit("/tag/blog");

      assert.equal(
        currentURL(),
        "/tags/intersection/support/blog",
        "creates intersection with filter preference and additional tag"
      );
    });
  }
);
