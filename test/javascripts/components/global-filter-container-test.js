import { visit } from "@ember/test-helpers";
import { acceptance, exists } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Filter Container", function (needs) {
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
  });

  test("is present when a tag is included in global_filters", async function (assert) {
    await visit("/");
    assert.ok(exists(".global-filter-container"), "container is present");
  });
});
