# frozen_string_literal: true

module Jobs
  class ::GlobalFilter::UpdateCategoryStats < ::Jobs::Scheduled
    every 1.day

    def execute(args = nil)
      # We have to calculate category totals per GFT as some categories may
      # be shared across GFTs and will contain unique topics leading to different topic/post counts
      # for a category based on what GFT it belongs to.

      # loop through each GFT
      SiteSetting.find_by(name: "global_filters").value.split("|").each do |gft|
        filter_tag = GlobalFilter::FilterTag.find_by(name: gft)
        filter_category_ids = filter_tag.category_ids.split("|")
        filter_category_ids = Category.pluck(:id) if filter_category_ids.empty?
        filter_category_ids = filter_category_ids.map(&:to_i)

        tag_id = Tag.find_by(name: gft).id

        total_topic_count_for_filter_tag = 0
        category_stats_for_filter = {}
        # loop through each category included in GFT
        filter_category_ids.each do |category_id|
          category_and_subcategory_ids = [category_id]
          category_and_subcategory_ids << Category.find(category_id).subcategories&.pluck(:id)
          category_and_subcategory_ids = category_and_subcategory_ids.flatten

          category_and_subcategory_ids.each do |cas|
            topics_for_category = Topic
              .joins(:tags)
              .where(category_id: cas)
              .where("topics.id NOT IN (SELECT cc.topic_id FROM categories cc WHERE topic_id IS NOT NULL)")
              .where(tags: tag_id)
              .group(:id, :category_id, :posts_count)
              .visible

            # build a json object so that we can generate a topic/post count for each category for the current GFT.
            # This object will be inserted into the filter_tag_category_mappings table that we can then use in the category_list serializer

            # for each category and its sub categories get topics tagged with GFT
            posts_count = topics_for_category.pluck(:posts_count).sum
            counts = { cas => { topic_count: topics_for_category.length, posts_count: posts_count } }
            category_stats_for_filter = category_stats_for_filter.deep_merge(counts)
          end

          # For parent categories, calculate topic counts
          category_and_subcategory_topics = Topic
            .joins(:tags)
            .where(category_id: category_and_subcategory_ids)
            .where("topics.id NOT IN (SELECT cc.topic_id FROM categories cc WHERE topic_id IS NOT NULL)")
            .where(tags: tag_id)
            .visible

          total_topic_count_for_filter_tag += category_and_subcategory_topics.length
          parent_category_topic_totals = { category_id => {
            topics_year: category_and_subcategory_topics.created_since(1.year.ago).count,
            topics_month: category_and_subcategory_topics.created_since(1.month.ago).count,
            topics_week: category_and_subcategory_topics.created_since(1.week.ago).count,
            topics_day: category_and_subcategory_topics.created_since(1.day.ago).count,
          } }
          category_stats_for_filter = category_stats_for_filter.deep_merge(parent_category_topic_totals)
        end

        filter_tag.update!(category_stats: category_stats_for_filter, total_topic_count: total_topic_count_for_filter_tag)
      end
    end
  end
end
