# frozen_string_literal: true

module GlobalFilter::CategoryListSerializerExtension
  def categories
    tags = options[:tags] || filter_tag
    filter_tag_ids =
      GlobalFilter::FilterTag.categories_for_tags(tags, scope).pluck(:id)
    filtered_categories =
      object.categories.filter { |c| filter_tag_ids.include?(c.id) }
    filtered_categories
  end
end
