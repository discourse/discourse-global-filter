# frozen_string_literal: true

class FilterTagSerializer < ApplicationSerializer
  attributes :id,
             :name,
             :category_ids

  has_many :categories, serializer: BasicCategorySerializer, embed: :objects

  def categories
    Category.secured(scope).where(id: object[:category_ids].split("|"))
  end
end
