# frozen_string_literal: true

module GlobalFilter::CategoryListSerializerExtension

  def categories
    filtered_categories = GlobalFilter::FilterTag.categories_for_tag(filter_tag, scope)
    category_stats = GlobalFilter::FilterTag.find_by(name: filter_tag)&.category_stats
    categories = filtered_categories.any? ? filtered_categories : object.categories

    return categories if category_stats.nil?
    update_topic_and_post_count(category_stats)
    categories
  end

  def update_topic_and_post_count(category_stats)
    category_stats.keys.map(&:to_i).each do |id|
      category_stats_for_category = category_stats[id.to_s]
      Category.find(id).update(post_count: category_stats_for_category.fetch("posts_count") || 0, topic_count: category_stats_for_category.fetch("topic_count") || 0)
    end
  end
end
