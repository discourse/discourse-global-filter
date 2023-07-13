# frozen_string_literal: true

class AddGlobalFilterTagsCategoryStatsToCategories < ActiveRecord::Migration[6.1]
  def change
    add_column :categories, :global_filter_tags_category_stats, :jsonb, null: false, default: {}
  end
end
