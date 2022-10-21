# frozen_string_literal: true

module GlobalFilter::SiteSerializerExtension

  def categories
    filter_tag_category_ids = GlobalFilter::FilterTag.find_by(name: filter_tag)&.category_ids&.split("|")&.map(&:to_i)
    return object.categories.map(&:to_h) if !filter_tag_category_ids

    filtered_categories = object.categories.select {|c| filter_tag_category_ids.include?(c[:id])}
    filtered_categories.map(&:to_h)
  end
end
