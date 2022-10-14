# frozen_string_literal: true

module Jobs
  class ::GlobalFilter::UpdateCategoryStats < ::Jobs::Scheduled
    every 1.day

    def execute(args = nil)

      Category.find_each do |c|
        category_and_subcategory_ids = [c.id]
        category_and_subcategory_ids << Category.find(c.id).subcategories&.pluck(:id)
        category_and_subcategory_ids = category_and_subcategory_ids.flatten

        per_filter_category_stats = {}
        SiteSetting.find_by(name: "global_filters").value.split("|").each do |gft|
          total_topic_count_for_filter_tag = 0
          category_stats_for_filter = {}
          filter_tag = GlobalFilter::FilterTag.find_by(name: gft)
          tag_id = Tag.find_by(name: gft).id

          topics_for_category_and_subcategories = Topic
            .joins(:tags)
            .where(category_id: category_and_subcategory_ids)
            .where("topics.id NOT IN (SELECT cc.topic_id FROM categories cc WHERE topic_id IS NOT NULL)")
            .where(tags: tag_id)
            .group(:id, :category_id, :posts_count)
            .visible

          posts_count = topics_for_category_and_subcategories.pluck(:posts_count).sum
          counts = { topic_count: topics_for_category_and_subcategories.length, posts_count: posts_count }
          category_stats_for_filter = category_stats_for_filter.deep_merge(counts)

          category_and_subcategory_topics = Topic
            .joins(:tags)
            .where(category_id: category_and_subcategory_ids)
            .where("topics.id NOT IN (SELECT cc.topic_id FROM categories cc WHERE topic_id IS NOT NULL)")
            .where(tags: tag_id)
            .visible

          total_topic_count_for_filter_tag += category_and_subcategory_topics.length
          filter_tag.update!(total_topic_count: total_topic_count_for_filter_tag)

          category_topic_totals = {
            topics_year: category_and_subcategory_topics.created_since(1.year.ago).count,
            topics_month: category_and_subcategory_topics.created_since(1.month.ago).count,
            topics_week: category_and_subcategory_topics.created_since(1.week.ago).count,
            topics_day: category_and_subcategory_topics.created_since(1.day.ago).count,
          }
          category_stats_for_filter = category_stats_for_filter.deep_merge(category_topic_totals)

          per_filter_category_stats = per_filter_category_stats.deep_merge({gft => category_stats_for_filter})
        end

        Category.find(c.id).update!(global_filter_tags_category_stats: per_filter_category_stats)
      end
    end
  end
end
