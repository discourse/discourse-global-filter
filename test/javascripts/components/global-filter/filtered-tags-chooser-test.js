import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import selectKit from "discourse/tests/helpers/select-kit-helper";

acceptance("Discourse Global Filter - Filtered Tags Chooser", function (needs) {
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
    tagging_enabled: true,
  });
  needs.site({
    filter_tags_total_topic_count: { support: 1, feature: 1 },
    global_filters: [
      { id: 1, name: "support" },
      { id: 2, name: "feature" },
    ],
  });

  needs.pretender((server, helper) => {
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
          topics: [],
          tags: [],
        },
      });
    });

    server.get(
      "/global_filter/filter_tags/categories_for_current_filter.json",
      () => helper.response({ categories: [], subcategories: [] })
    );
  });

  test("hides the selected global filter tag from the tag-drop chooser", async function (assert) {
    await visit("/tag/support");

    assert
      .dom(".filtered-tag-drop .tag-drop .name")
      .hasText("tags", "does not display the selected global filter");

    const tags = selectKit(".filtered-tag-drop .tag-drop");
    await tags.expand();

    assert.notOk(
      tags.rowByValue("support").exists(),
      "global filter is not displayed as selected"
    );
  });
});
