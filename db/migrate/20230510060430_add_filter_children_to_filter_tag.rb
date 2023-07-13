# frozen_string_literal: true

class AddFilterChildrenToFilterTag < ActiveRecord::Migration[7.0]
  def change
    add_column :filter_tag_category_mappings,
               :filter_children,
               :jsonb,
               null: false,
               default: {}
  end
end
