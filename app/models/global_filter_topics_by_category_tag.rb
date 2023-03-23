# frozen_string_literal: true

class GlobalFilter::GlobalFilterTopicsByCategoryTag < ::ActiveRecord::Base
  self.table_name = "global_filter_topics_by_category_tags"

  belongs_to :category

  def self.most_recent_unpinned_topic_for(category_id:, tag_id:)
    Topic
      .includes(user: :primary_group)
      .joins(:tags)
      .where(category_id: category_id)
      .where("pinned_until IS NULL OR pinned_until < ? ", Time.zone.now)
      .visible
      .where("tags.id IN (?)", tag_id)
      .order("created_at DESC")
      .first
  end
end
