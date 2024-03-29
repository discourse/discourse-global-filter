# frozen_string_literal: true

class FilterTagDetailedSerializer < ApplicationSerializer
  attributes :id, :name, :category_ids, :alternate_name, :alternate_composer_only, :filter_children

  has_many :categories, serializer: BasicCategorySerializer, embed: :objects

  def categories
    Category.secured(scope).where(id: object[:category_ids].split("|"))
  end

  def include_filter_children?
    object.filter_children.present?
  end
end
