# frozen_string_literal: true

class AddGlobalFilterPreference < ActiveRecord::Migration[7.0]
  def change
    add_index :user_custom_fields, %i[name user_id], name: :idx_user_custom_fields_global_filter_preference,
                                                     unique: true, where: "name = 'global_filter_preference'"
  end
end
