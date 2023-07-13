# frozen_string_literal: true

class GlobalFilter::FilterTag < ::ActiveRecord::Base
  self.table_name = "filter_tag_category_mappings"

  self.ignored_columns = [
    :category_stats, # TODO(2023-04-01): remove
  ]

  def self.categories_for_tags(tags, scope)
    filter_tags = self.where(name: tags)
    filter_tags_category_ids =
      filter_tags
        &.pluck(:category_ids)
        .flat_map { |c| c.present? ? c.split("|") : Category.secured(scope).pluck(:id) }

    Category.secured(scope).where(id: filter_tags_category_ids)
  end
end
