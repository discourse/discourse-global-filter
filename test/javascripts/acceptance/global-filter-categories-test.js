import { settled, visit } from "@ember/test-helpers";
import { test } from "qunit";
import CategoryList from "discourse/models/category-list";
import { acceptance } from "discourse/tests/helpers/qunit-helpers";

acceptance(
  "Acceptance | Discourse Global Filter | globalFilterListCallbacks",
  function (needs) {
    needs.settings({
      discourse_global_filter_enabled: true,
      desktop_category_page_style: "subcategories_with_featured_topics",
      global_filters: "support|feature",
      tagging_enabled: true,
    });

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
      globalFilter: "feature",
    });

    needs.pretender((server, helper) => {
      server.get(
        "/global_filter/filter_tags/categories_for_current_filter.json",
        () =>
          helper.response({
            categories: [sadCat],
            subcategories: [],
          })
      );

      server.get("/categories.json", () =>
        helper.response({
          category_list: {
            can_create_category: false,
            can_create_topic: false,
            categories: [sadCat],
          },
        })
      );
    });

    test("callback is called with the category list and global filter used", async function (assert) {
      let cbCalled = false;
      let cbGlobalFilter = null;
      let cbCategoryId = null;

      const cb = (categoryList) => {
        cbCalled = true;
        cbGlobalFilter = categoryList.globalFilter;
        cbCategoryId = categoryList.categories.content[0].id;
      };

      CategoryList.globalFilterListCallbacks.push(cb);
      try {
        await visit("/categories?tag=feature");

        assert.strictEqual(cbCalled, true, "callback was called");
        assert.strictEqual(
          cbGlobalFilter,
          "feature",
          "globalFilter is set correctly"
        );
        assert.strictEqual(cbCategoryId, 101, "category id matches");
      } finally {
        CategoryList.globalFilterListCallbacks = [];
      }
    });
  }
);
