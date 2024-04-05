# frozen_string_literal: true

module GlobalFilter::CategoryDetailedSerializerExtension
  def topic_count
    object.global_filter_tags_category_stats[filter_tag]&.fetch("topic_count", 0) || 0
  end

  def post_count
    object.global_filter_tags_category_stats[filter_tag]&.fetch("posts_count", 0) || 0
  end

  def topics_day
    total_count_for_category_per("topics_day")
  end

  def topics_week
    total_count_for_category_per("topics_week")
  end

  def topics_month
    total_count_for_category_per("topics_month")
  end

  def topics_year
    total_count_for_category_per("topics_year")
  end

  def total_count_for_category_per(time)
    object.global_filter_tags_category_stats[filter_tag]&.fetch(time, 0) || 0
  end

  def subcategory_list
    # subcategory_list is called in the include_subcategory_list? method.
    # memoizing it here saves the result to be used when the value is serialized if the include? method returns true.
    return @subcategory_list if defined?(@subcategory_list)

    filter_tag_ids = scope.secure_categories_for_filter_tags_ids(filter_tag)
    filtered_categories =
      (
        if object.subcategory_list.present?
          object.subcategory_list.filter { |c| filter_tag_ids.include?(c.id) }
        else
          []
        end
      )

    @subcategory_list = filtered_categories
  end
end
