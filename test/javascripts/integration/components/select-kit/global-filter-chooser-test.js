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
          filter_children: {},
        },
      ]);
    });

    test("displays global filters", async function (assert) {
      this.set("value", ["support"]);
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      await this.subject.expand();

      assert.strictEqual(this.subject.rowByIndex(0).value(), "feature");
      assert.strictEqual(this.subject.rowByIndex(1).value(), "foo");
    });

    test("displays selected value", async function (assert) {
      this.set("value", ["support"]);
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      assert.strictEqual(this.subject.header().name(), "support");
    });

    test("displays alternate name (when present) in the dropdown", async function (assert) {
      this.set("value", ["support"]);
      await render(hbs`<GlobalFilterChooser @value={{this.value}} />`);

      await this.subject.expand();

      assert.strictEqual(
        this.subject.rowByIndex(0).label(),
        "feature-alt-name"
      );
      assert.strictEqual(this.subject.rowByIndex(1).label(), "foo");
    });
  }
);
