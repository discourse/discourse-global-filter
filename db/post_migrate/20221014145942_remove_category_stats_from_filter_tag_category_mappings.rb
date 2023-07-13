# frozen_string_literal: true

class RemoveCategoryStatsFromFilterTagCategoryMappings < ActiveRecord::Migration[7.0]
  DROPPED_COLUMNS ||= { filter_tag_category_mappings: %i[category_stats] }

  def up
    DROPPED_COLUMNS.each { |table, columns| Migration::ColumnDropper.execute_drop(table, columns) }
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
