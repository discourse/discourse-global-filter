# frozen_string_literal: true

class GlobalFilter::FilterTag < ::ActiveRecord::Base
  self.table_name = "filter_tag_category_mappings"

  def self.categories_for_tag(tag)
    filter_tag = self.find_by(name: tag)
    return [] if !filter_tag&.category_ids&.present?
    Category.where(id: filter_tag.category_ids.split("|")).to_a
  end
end
