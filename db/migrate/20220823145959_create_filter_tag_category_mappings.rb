# frozen_string_literal: true

class CreateFilterTagCategoryMappings < ActiveRecord::Migration[6.1]
  def change
    create_table :filter_tag_category_mappings do |t|
      t.string :name, null: false
      t.string :category_ids, null: false, default: ""
      t.timestamps
    end

    add_index :filter_tag_category_mappings, [:name], unique: true
  end
end
