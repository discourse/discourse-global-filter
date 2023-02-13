# frozen_string_literal: true

class FilterTagSerializer < ApplicationSerializer
  attributes :id,
             :name,
             :category_ids,
             :alternate_name,
             :alternate_composer_only

  has_many :categories, serializer: BasicCategorySerializer, embed: :objects

  def categories
    Category.secured(scope).where(id: object[:category_ids].split("|"))
  end
end
