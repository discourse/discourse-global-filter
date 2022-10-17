# frozen_string_literal: true

module GlobalFilter::CategoryListSerializerExtension

  def categories
    tags = options[:tags] || filter_tag
    GlobalFilter::FilterTag.categories_for_tags(tags, scope)
  end
end
