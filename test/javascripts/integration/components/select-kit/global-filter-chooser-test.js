import { module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";
import selectKit from "discourse/tests/helpers/select-kit-helper";
import pretender, { response } from "discourse/tests/helpers/create-pretender";

module(
  "Integration | Component | select-kit/global-filter-chooser",
  function (hooks) {
    setupRenderingTest(hooks);
    hooks.beforeEach(function () {
      pretender.get(
        "/global_filter/filter_tags/categories_for_current_filter.json",
        () => {
          return response({});
        }
      );
      this.set("subject", selectKit());
      this.site.set("global_filters", [
        {
          id: 5,
          name: "support",
          category_ids: "0|30|17|11",
          total_topic_count: 1,
          alternate_name: "support-alt-name",
          alternate_composer_only: false,
          filter_children: {},
        },
        {
          id: 6,
          name: "feature",
          category_ids: "",
          total_topic_count: 6,
          alternate_name: "feature-alt-name",
          alternate_composer_only: false,
          filter_children: {},
        },
        {
          id: 7,
          name: "foo",
          category_ids: "",
          total_topic_count: 6,
          alternate_name: null,
          alternate_composer_only: false,
          filter_children: {
            "foo-child": {
              name: "foo-child",
              icon: null,
              alternate_name: "foo-child-alt-name",
              parent: "foo",
            },
          },
        },
      ]);
    });

    test("displays selected value", async function (assert) {
      this.set("value", ["support"]);
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      assert.strictEqual(this.subject.header().name(), "support");
    });

    test("displays alternate global-filter name (when present) in the dropdown", async function (assert) {
      this.set("value", ["random"]);
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      await this.subject.expand();

      assert.strictEqual(
        this.subject.rowByIndex(0).label(),
        "support-alt-name"
      );
      assert.strictEqual(
        this.subject.rowByIndex(1).label(),
        "feature-alt-name"
      );
    });

    test("displays filter children", async function (assert) {
      this.set("value", ["support"]);
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      await this.subject.expand();

      assert.strictEqual(
        this.subject.rowByIndex(0).label(),
        "feature-alt-name"
      );
      assert.strictEqual(this.subject.rowByIndex(1).label(), "foo");
      assert.strictEqual(
        this.subject.rowByIndex(2).label(),
        "foo-child-alt-name"
      );
    });

    test("replaces parent with children when replace_global_filter_with_children is true", async function (assert) {
      this.set("value", ["support"]);
      this.siteSettings.replace_global_filter_with_children = true;
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      await this.subject.expand();

      assert.strictEqual(
        this.subject.rowByIndex(0).label(),
        "feature-alt-name"
      );
      assert.strictEqual(
        this.subject.rowByIndex(1).label(),
        "foo-child-alt-name"
      );
    });
  }
);
