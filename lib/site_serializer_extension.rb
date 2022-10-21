# frozen_string_literal: true

module GlobalFilter::SiteSerializerExtension

  def categories
    filter_tag_category_ids = GlobalFilter::FilterTag.find_by(name: filter_tag)&.category_ids&.split("|")&.map(&:to_i)
    filter_tag_category_ids = Category.secured(scope).pluck(:id) if filter_tag_category_ids.empty?
    filtered_categories = object.categories.select {|c| filter_tag_category_ids.include?(c[:id])}
    filtered_categories.empty? ? object.categories.map(&:to_h) : filtered_categories.map(&:to_h)
  end
end
