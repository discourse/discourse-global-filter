import { visit } from "@ember/test-helpers";
import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import selectKit from "discourse/tests/helpers/select-kit-helper";

acceptance("Discourse Global Filter - Filtered Tags Chooser", function (needs) {
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
    tagging_enabled: true,
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
  });

  test("hides the selected global filter tag from the tag-drop chooser", async function (assert) {
    await visit("/tag/support");

    assert.strictEqual(
      query(".filtered-tag-drop .tag-drop .name").innerText,
      "all tags",
      "does not display the selected global filter"
    );

    const tags = selectKit(".filtered-tag-drop .tag-drop");
    await tags.expand();

    assert.notOk(
      tags.rowByValue("support").exists(),
      "global filter is not displayed as selected"
    );
  });
});
