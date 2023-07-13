# frozen_string_literal: true

class CreateGlobalFilterTopicsByCategoryTag < ActiveRecord::Migration[7.0]
  def change
    create_table :global_filter_topics_by_category_tags do |t|
      t.integer :category_id, null: false
      t.jsonb :topic_tag_mapping, null: false, default: {}
      t.timestamps
    end

    add_index :global_filter_topics_by_category_tags, [:category_id], unique: true
  end
end
