import { click, visit } from "@ember/test-helpers";
import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import selectKit from "discourse/tests/helpers/select-kit-helper";

acceptance(
  "Discourse Global Filter - Composer - Global Filter Chooser",
  function (needs) {
    needs.user();
    needs.settings({
      discourse_global_filter_enabled: true,
      global_filters: "support|feature|foo",
    });
    needs.site({
      can_tag_topics: true,
      filter_tags_total_topic_count: { support: 1, feature: 1, foo: 1 },
      global_filters: [
        { id: 1, name: "support" },
        { id: 2, name: "feature" },
        {
          id: 3,
          name: "foo",
          filter_children: {
            "foo-child": {
              name: "foo-child",
              icon: "foo-custom-icon",
              parent: "foo",
              alternate_name: null,
            },
          },
        },
      ],
    });

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

    test("global filter is present when creating a topic on a global-filter tag route", async function (assert) {
      await visit("/tag/support");
      await click("#create-topic");

      assert.strictEqual(
        selectKit(".global-filter-chooser").header().value(),
        "support",
        "global filter is selected"
      );
    });

    test("adding/removing global-filter removes/adds correct tags", async function (assert) {
      await visit("/");
      await click("#create-topic");
      await selectKit(".global-filter-chooser").expand();

      // remove support global filter
      await click(
        ".global-filter-chooser .selected-content button.selected-choice"
      );
      // add feature global filter
      await selectKit(".global-filter-chooser").selectRowByValue("feature");

      let composer = this.owner.lookup("controller:composer");
      assert.deepEqual(
        composer.get("model").tags,
        ["feature"],
        "expected filter is present"
      );
    });

    test("custom icon is used when present for a filter child", async function (assert) {
      await visit("/");
      await click("#create-topic");
      await selectKit(".global-filter-chooser").expand();
      assert.strictEqual(
        query(
          ".global-filter-chooser .select-kit-collection li[data-name=foo-child] use"
        ).getAttribute("href"),
        "#foo-custom-icon",
        "select kit item has the correct custom icon"
      );
    });
  }
);
