# frozen_string_literal: true

module GlobalFilter::CategoryListSerializerExtension
  def categories
    tags = options[:tags] || filter_tag
    filter_tag_ids = scope.secure_categories_for_filter_tags_ids(tags)
    filtered_categories = object.categories.filter { |c| filter_tag_ids.include?(c.id) }
    filtered_categories
  end
end
