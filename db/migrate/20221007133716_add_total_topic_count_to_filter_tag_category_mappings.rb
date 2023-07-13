# frozen_string_literal: true

class AddTotalTopicCountToFilterTagCategoryMappings < ActiveRecord::Migration[6.1]
  def change
    add_column :filter_tag_category_mappings, :total_topic_count, :integer, null: false, default: 0
  end
end
