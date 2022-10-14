# frozen_string_literal: true

module GlobalFilter::CategoryDetailedSerializerExtension
  def topic_count
    object.global_filter_tags_category_stats[filter_tag].fetch("topic_count", 0)
  end

  def post_count
    object.global_filter_tags_category_stats[filter_tag].fetch("posts_count", 0)
  end

  def topics_day
    total_count_for_category_per('topics_day')
  end

  def topics_week
    total_count_for_category_per('topics_week')
  end

  def topics_month
    total_count_for_category_per('topics_month')
  end

  def topics_year
    total_count_for_category_per('topics_year')
  end

  def total_count_for_category_per(time)
    object.global_filter_tags_category_stats[filter_tag].fetch(time, 0)
  end
end
