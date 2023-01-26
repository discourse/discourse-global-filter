import { visit } from "@ember/test-helpers";
import {
  acceptance,
  exists,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";

acceptance("Discourse Global Filter - Filter Item", function (needs) {
  needs.user();
  needs.site({
    filter_tags_total_topic_count: { support: 1, feature: 1 },
    global_filters: [
      { id: 1, name: "support" },
      { id: 2, name: "feature" },
    ],
  });
  needs.settings({
    discourse_global_filter_enabled: true,
    global_filters: "support|feature",
  });

  needs.pretender((server, helper) => {
    ["support", "feature"].forEach((tag) => {
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
    });

    server.get(
      "/global_filter/filter_tags/categories_for_current_filter.json",
      () => helper.response({ categories: [], subcategories: [] })
    );

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

    server.get("/t/54077.json", () => {
      return helper.response({
        pending_posts: [],
        post_stream: {
          posts: [
            {
              id: 398,
              name: "james, john, the third",
              username: "james_john",
              avatar_template:
                "/letter_avatar_proxy/v4/letter/j/3be4f8/{size}.png",
              uploaded_avatar_id: 5697,
              created_at: "2013-02-05T21:29:00.280Z",
              cooked: "<p>This is a short topic.</p>",
              post_number: 1,
              post_type: 1,
              updated_at: "2013-02-05T21:29:00.280Z",
              like_count: 0,
              reply_count: 1,
              reply_to_post_number: null,
              quote_count: 0,
              incoming_link_count: 314,
              reads: 475,
              score: 1702.25,
              yours: false,
              topic_id: 54079,
              topic_slug: "short-topic-with-two-posts",
              display_username: "james, john, the third",
              primary_group_name: null,
              version: 1,
              can_edit: true,
              can_delete: false,
              can_recover: true,
              link_counts: [],
              read: true,
              user_title: null,
              actions_summary: [
                {
                  id: 2,
                  count: 0,
                  hidden: false,
                  can_act: true,
                },
              ],
              moderator: false,
              admin: false,
              staff: false,
              user_id: 255,
              hidden: false,
              hidden_reason_id: null,
              trust_level: 2,
              deleted_at: null,
              user_deleted: false,
              edit_reason: null,
              can_view_edit_history: true,
              wiki: false,
            },
          ],
        },
        id: 54077,
        title: "Short topic with two posts",
        fancy_title: "Short topic with two posts",
        posts_count: 2,
        created_at: "2013-02-05T21:29:00.174Z",
        views: 5211,
        reply_count: 1,
        participant_count: 2,
        like_count: 135,
        last_posted_at: "2015-03-04T15:07:10.487Z",
        visible: true,
        closed: false,
        archived: false,
        has_summary: true,
        archetype: "regular",
        slug: "short-topic-with-two-posts",
        category_id: 2,
        word_count: 300,
        deleted_at: null,
        draft: null,
        draft_key: "topic_54077",
        draft_sequence: 3,
        posted: true,
        unpinned: null,
        pinned_globally: false,
        pinned: false,
        pinned_at: null,
        details: {
          can_publish_page: true,
          can_invite_via_email: true,
          can_toggle_topic_visibility: true,
          can_pin_unpin_topic: true,
          auto_close_at: null,
          auto_close_hours: null,
          auto_close_based_on_last_post: false,
          created_by: {
            id: 255,
            username: "uwe_keim",
            uploaded_avatar_id: 5697,
            avatar_template: "/images/avatar.png",
          },
          last_poster: {
            id: 9,
            username: "Tim Stone",
            uploaded_avatar_id: 40181,
            avatar_template: "/images/avatar.png",
          },
          participants: [
            {
              id: 9,
              username: "tms",
              uploaded_avatar_id: 40181,
              avatar_template: "/images/avatar.png",
              post_count: 2,
            },
            {
              id: 255,
              username: "uwe_keim",
              uploaded_avatar_id: 5697,
              avatar_template: "/images/avatar.png",
              post_count: 1,
            },
          ],
          links: [],
          notification_level: 2,
          notifications_reason_id: 4,
          can_move_posts: true,
          can_edit: true,
          can_delete: true,
          can_recover: true,
          can_remove_allowed_users: true,
          can_invite_to: true,
          can_create_post: true,
          can_reply_as_new_topic: true,
          can_flag_topic: true,
        },
        highest_post_number: 2,
        last_read_post_number: 2,
        deleted_by: null,
        has_deleted: true,
        actions_summary: [],
        chunk_size: 20,
        bookmarked: false,
        bookmarks: [],
        suggested_topics: [],
        tags: ["support", "feature"],
      });
    });
  });

  test("is present when included in global_filters", async function (assert) {
    await visit("/");
    let tags = [];
    queryAll(".global-filter-container .global-filter-item").each((_, el) => {
      // strip new lines to test values
      tags.push(el.innerText.replace(/\n/g, " "));
    });
    assert.deepEqual(tags, ["support 1", "feature 1"]);
  });

  test("adds active class to filter", async function (assert) {
    await visit("/tag/support");

    assert.ok(
      exists(
        ".global-filter-container #global-filter-support .global-filter-button.active"
      ),
      "item is active"
    );
  });

  test("navigating to a topic maintains correct global-filter css class", async function (assert) {
    const currentUser = this.container.lookup("current-user:main");
    // set global filter pref to a value that is not the first option
    currentUser.custom_fields.global_filter_preference = "feature";
    await visit("/t/54077");

    assert.ok(
      exists(
        ".global-filter-container #global-filter-feature .global-filter-button.active"
      ),
      "correct global-filter-item is active"
    );
  });
});
