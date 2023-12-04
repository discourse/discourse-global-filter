import { visit } from "@ember/test-helpers";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import selectKit from "discourse/tests/helpers/select-kit-helper";

acceptance(
  "Discourse Global Filter - Set Category Drop Options",
  function (needs) {
    needs.settings({
      discourse_global_filter_enabled: true,
      global_filters: "support|feature",
      tagging_enabled: true,
    });

    const mazeCategory = {
      id: 100,
      name: "amazeCat",
      slug: "amazeCat",
      permission: 1,
      has_children: true,
    };

    const sadCat = {
      id: 101,
      name: "sadCat",
      slug: "sadCat",
      permission: 1,
    };

    needs.site({
      filter_tags_total_topic_count: { support: 1, feature: 1 },
      global_filters: [
        { id: 1, name: "support" },
        { id: 2, name: "feature" },
      ],
      categories: [
        mazeCategory,
        sadCat,
        {
          id: 102,
          name: "happyCat",
          slug: "happyCat",
          permission: 1,
          parentCategory: mazeCategory,
        },
        {
          id: 103,
          name: "grumpyCat",
          slug: "grumpyCat",
          permission: 1,
          parentCategory: mazeCategory,
        },
        {
          id: 104,
          name: "generalCat",
          slug: "generalCat",
          permission: 1,
        },
      ],
    });

    needs.pretender((server, helper) => {
      server.get("/tags/c/amazeCat/100/support/l/latest.json", () => {
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

      server.get(
        "/global_filter/filter_tags/categories_for_current_filter.json",
        () =>
          helper.response({
            categories: [mazeCategory, sadCat],
            subcategories: [{ id: 102, name: "happyCat" }],
          })
      );
    });

    test("only displays categories returned from `/categories_for_current_filter`", async function (assert) {
      await visit("/categories");
      const categories = selectKit(
        ".gft-parent-categories-drop .category-drop"
      );
      await categories.expand();

      assert.strictEqual(categories.rowByIndex(0).value(), "100");
      assert.strictEqual(categories.rowByIndex(1).value(), "101");
      assert.strictEqual(categories.rows().length, 2);
    });

    test("only displays subcategories returned from `/categories_for_current_filter`", async function (assert) {
      await visit(`/tags/c/amazeCat/100/support`);
      const categories = selectKit(".gft-subcategories-drop .category-drop");
      await categories.expand();

      // includes default values
      assert.strictEqual(categories.rowByIndex(0).value(), "102");
      assert.strictEqual(categories.rows().length, 1);
    });

    test("limits options to GFT categories when filtering", async function (assert) {
      await visit("/categories");
      const categories = selectKit(
        ".gft-parent-categories-drop .category-drop"
      );
      await categories.expand();
      await categories.fillInFilter("amaze");

      assert.ok(
        categories.rowByName("amazeCat").exists(),
        "include category with term when filtering"
      );

      assert.ok(
        !categories.rowByName("grumpyCat").exists(),
        "does not include all categories when filtering"
      );
    });
  }
);
