# frozen_string_literal: true

require "rails_helper"

RSpec.describe GlobalFilter::UpdateGlobalFilterTopicsByCategoryTags do
  describe "#perform" do
    fab!(:category_0) { Fabricate(:category) }
    fab!(:category_1) { Fabricate(:category) }

    fab!(:tag_0) { Fabricate(:tag) }
    fab!(:tag_1) { Fabricate(:tag) }

    fab!(:user) { Fabricate(:user) }

    # Category 0 topics
    fab!(:category_0_topic_0) { Fabricate(:topic, category: category_0, tags: [tag_0], user: user) }
    fab!(:category_0_topic_1) { Fabricate(:topic, category: category_0, tags: [tag_1], user: user) }

    # Category 1 topics
    fab!(:category_1_topic_0) { Fabricate(:topic, category: category_1, tags: [tag_0], user: user) }
    fab!(:category_1_topic_1) { Fabricate(:topic, category: category_1, tags: [tag_1], user: user) }

    it "inserts the correct topic_tag_mappings for each category" do
      SiteSetting.global_filters = "#{tag_0.name}|#{tag_1.name}"
      GlobalFilter::UpdateGlobalFilterTopicsByCategoryTags.new.perform

      # For category one, make sure there are the proper 2 tag keys, and then check each to make sure the topic/user
      # attributes are correct
      category_0_mapping = category_0.global_filter_topics_by_category_tag.topic_tag_mapping
      expect(category_0_mapping.keys).to match_array([tag_0.name, tag_1.name])
      expect(category_0_mapping[tag_0.name]).to include(
        "title" => category_0_topic_0.title,
        "url" => category_0_topic_0.url,
        "user" => {
          "username" => user.username,
          "avatar_template" => user.small_avatar_url
        }
      )

      expect(category_0_mapping[tag_1.name]).to include(
        "title" => category_0_topic_1.title,
        "url" => category_0_topic_1.url,
        "user" => {
          "username" => user.username,
          "avatar_template" => user.small_avatar_url
        }
      )

      category_1_mapping = category_1.global_filter_topics_by_category_tag.topic_tag_mapping
      expect(category_1_mapping.keys).to match_array([tag_0.name, tag_1.name])
      expect(category_1_mapping[tag_0.name]).to include(
        "title" => category_1_topic_0.title,
        "url" => category_1_topic_0.url,
        "user" => {
          "username" => user.username,
          "avatar_template" => user.small_avatar_url
        }
      )

      expect(category_1_mapping[tag_1.name]).to include(
        "title" => category_1_topic_1.title,
        "url" => category_1_topic_1.url,
        "user" => {
          "username" => user.username,
          "avatar_template" => user.small_avatar_url
        }
      )

    end
  end
end
