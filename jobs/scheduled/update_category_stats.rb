# frozen_string_literal: true

module Jobs
  class ::GlobalFilter::UpdateCategoryStats < ::Jobs::Scheduled
    every 1.hour

    def execute(args = nil)
      filter_tags = SiteSetting.find_by(name: "global_filters").value.split("|")

      # Calculate topic / post totals for each GFT for each category
      Category.find_each do |c|
        category_and_subcategory_ids = [c.id]
        category_and_subcategory_ids << Category.find(c.id).subcategories&.pluck(:id)
        category_and_subcategory_ids = category_and_subcategory_ids.flatten

        per_filter_category_stats = {}
        filter_tags.each do |gft|
          category_stats_for_filter = {}
          filter_tag = GlobalFilter::FilterTag.find_by(name: gft)
          tag_id = Tag.find_by(name: gft).id

          category_and_subcategory_topics = Topic
            .joins(:tags)
            .where(category_id: category_and_subcategory_ids)
            .where("topics.id NOT IN (SELECT cc.topic_id FROM categories cc WHERE topic_id IS NOT NULL)")
            .where(tags: tag_id)
            .visible

          posts_count = category_and_subcategory_topics.pluck(:posts_count).sum
          counts = { topic_count: category_and_subcategory_topics.count, posts_count: posts_count }
          category_stats_for_filter = category_stats_for_filter.deep_merge(counts)

          category_topic_totals = {
            topics_year: category_and_subcategory_topics.created_since(1.year.ago).count,
            topics_month: category_and_subcategory_topics.created_since(1.month.ago).count,
            topics_week: category_and_subcategory_topics.created_since(1.week.ago).count,
            topics_day: category_and_subcategory_topics.created_since(1.day.ago).count,
          }
          category_stats_for_filter = category_stats_for_filter.deep_merge(category_topic_totals)

          per_filter_category_stats = per_filter_category_stats.deep_merge({ gft => category_stats_for_filter })
        end

        Category.find(c.id).update!(global_filter_tags_category_stats: per_filter_category_stats)
      end

      # Calculate topic totals per GFT
      filter_tags.each do |gft|
        filter_tag = GlobalFilter::FilterTag.find_by(name: gft)
        tag_id = Tag.find_by(name: gft).id
        filter_category_ids = filter_tag.category_ids.split("|")
        filter_category_ids = Category.pluck(:id) if filter_category_ids.empty?
        filter_category_ids = filter_category_ids.map(&:to_i)
        category_ids_with_sub_categories = []
        filter_category_ids.each do |fc|
          category_ids_with_sub_categories = category_ids_with_sub_categories.push(*Category.find(fc).subcategories.pluck(:id))
          category_ids_with_sub_categories = category_ids_with_sub_categories << fc
        end

        category_and_subcategory_topics = Topic
          .joins(:tags)
          .where(category_id: category_ids_with_sub_categories)
          .where("topics.id NOT IN (SELECT cc.topic_id FROM categories cc WHERE topic_id IS NOT NULL)")
          .where(tags: tag_id)
          .visible

        filter_tag.update!(total_topic_count: category_and_subcategory_topics.count)
      end
    end
  end
end
