# frozen_string_literal: true

class AddAternateNameAndAlternateComposerOnlyToFilterTag < ActiveRecord::Migration[6.1]
  def change
    add_column :filter_tag_category_mappings, :alternate_name, :string, null: true, default: nil
    add_column :filter_tag_category_mappings, :alternate_composer_only, :boolean, null: false, default: false
  end
end
