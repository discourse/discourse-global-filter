# frozen_string_literal: true

class AddCategoryStatsToFilterTagCategoryMappings < ActiveRecord::Migration[6.1]
  def change
    add_column :filter_tag_category_mappings,
               :category_stats,
               :jsonb,
               null: false,
               default: {}
  end
end
