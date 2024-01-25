import { click, currentURL, visit } from "@ember/test-helpers";
import { test } from "qunit";
import { setDefaultHomepage } from "discourse/lib/utilities";
import {
  acceptance,
  query,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";

acceptance(
  "Discourse Global Filter - Filter Preference Initializer",
  function (needs) {
    needs.user();

    needs.hooks.beforeEach(function () {
      updateCurrentUser({
        custom_fields: { global_filter_preference: "support" },
      });
    });

    needs.site({
      filter_tags_total_topic_count: { support: 1, feature: 1 },
      global_filters: [
        { id: 1, name: "support" },
        { id: 2, name: "feature", filter_children: { "bug-report": {} } },
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

      server.get("/tag/feature/notifications", () =>
        helper.response({
          tag_notification: { id: "feature", notification_level: 2 },
        })
      );

      server.get("/session/passkey/challenge.json", () => {
        return helper.response({ challenge: "123" });
      });

      const emptyResponseHandler = () => {
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
      };

      const successResponseHandler = () => helper.response({ success: true });

      server.get("/tags/intersection/support/blog.json", emptyResponseHandler);

      server.get("/tag/support/l/top.json", emptyResponseHandler);
      server.get("/tag/support/l/latest.json", emptyResponseHandler);

      server.get("/tag/blog/l/latest.json", emptyResponseHandler);

      server.get("/tag/feature/l/latest.json", emptyResponseHandler);

      server.put(
        "/global_filter/filter_tags/support/assign.json",
        successResponseHandler
      );
      server.put(
        "/global_filter/filter_tags/feature/assign.json",
        successResponseHandler
      );

      server.get(
        "/global_filter/filter_tags/categories_for_current_filter.json",
        successResponseHandler
      );
    });

    test("redirects to default homepage when selected", async function (assert) {
      await visit("/");
      assert.strictEqual(
        query(".global-filter-container #global-filter-support a").getAttribute(
          "href"
        ),
        "/tag/support",
        "it redirects to the right tag"
      );
    });

    test("redirects to categories if it is default homepage when selected", async function (assert) {
      setDefaultHomepage("categories");
      await visit("/");
      assert.strictEqual(
        query(".global-filter-container #global-filter-support a").getAttribute(
          "href"
        ),
        "/categories?tag=support",
        "it redirects to categories with the right tag"
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
      const currentUser = this.container.lookup("service:current-user");
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

    test("/categories redirects to include GFT query param", async function (assert) {
      await visit("/categories");

      assert.equal(
        currentURL(),
        "/categories?tag=support",
        "it redirects to the user's global_filter_preference"
      );
    });

    test("/login works with categories as default homepage", async function (assert) {
      setDefaultHomepage("categories");
      await visit("/login");

      assert.equal(
        currentURL(),
        "/categories?tag=support",
        "it redirects to the user's global_filter_preference"
      );
    });

    test("global filter tags used on /new-topic", async function (assert) {
      await visit("/new-topic?tags=feature");

      assert.ok(
        document.body.classList.contains("global-filter-tag-feature"),
        "it navigates to the global filter used in the new-topic tags query param"
      );
    });

    test("child tag of global filter used on /new-topic", async function (assert) {
      await visit("/new-topic?tags=bug-report");

      assert.ok(
        document.body.classList.contains("global-filter-tag-feature"),
        "it redirects to the global filter if the new-topic tags query param is a child of one"
      );
    });

    test("uses stored global filter preference at /", async function (assert) {
      setDefaultHomepage("categories");
      await visit("/categories?tag=feature");

      assert.equal(
        currentURL(),
        "/categories?tag=feature",
        "it navigates to the global filter"
      );

      await visit("/");

      assert.equal(
        currentURL(),
        "/categories?tag=feature",
        "it navigates to the stored global filter preference"
      );

      assert.ok(
        document.body.classList.contains("global-filter-tag-feature"),
        "it shows the global filter preference app"
      );
    });
  }
);
