# frozen_string_literal: true

require "rails_helper"

RSpec.describe GlobalFilter::GlobalFilterTopicsByCategoryTag do
  describe ".most_recent_unpinned_topic_for" do
    fab!(:category_0) { Fabricate(:category) }
    fab!(:category_1) { Fabricate(:category) }

    fab!(:tag_0) { Fabricate(:tag) }
    fab!(:tag_1) { Fabricate(:tag) }

    fab!(:topic_to_be_fetched) { Fabricate(:topic, category: category_0, tags: [tag_0, tag_1], created_at: 2.days.ago) }
    fab!(:older_topic) { Fabricate(:topic, category: category_0, tags: [tag_0], created_at: 10.days.ago) }
    fab!(:newer_pinned_topic) { Fabricate(:topic, category: category_0, tags: [tag_0], pinned_until: 2.days.from_now, created_at: Time.now) }
    fab!(:topic_without_tag) { Fabricate(:topic, category: category_0, tags: [tag_1], created_at: Time.now) }
    fab!(:topic_without_category) { Fabricate(:topic, category: category_1, tags: [tag_0], created_at: Time.now) }

    it "fetches the most recently created topic when a given tag_id and category_id" do
      expect(
        GlobalFilter::GlobalFilterTopicsByCategoryTag.most_recent_unpinned_topic_for(category_id: category_0.id, tag_id: tag_0.id)
      ).to eq(topic_to_be_fetched)
    end
  end
end
