# frozen_string_literal: true

module GlobalFilter::CategoryDetailedSerializerExtension
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
    category_stats = GlobalFilter::FilterTag.find_by(name: filter_tag)&.category_stats
    return 0 if category_stats.nil? || category_stats[object.id.to_s].nil?

    category_stats[object.id.to_s]&.fetch(time, 0)
  end
end
