# frozen_string_literal: true

module GlobalFilter::CategoryListSerializerExtension

  def categories
    filtered_categories = GlobalFilter::FilterTag.categories_for_tag(filter_tag, scope)
    filtered_categories.any? ? filtered_categories : object.categories
  end
end
