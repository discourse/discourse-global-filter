# frozen_string_literal: true

class GlobalFilter::AdminFilterTagIndexSerializer < ApplicationSerializer
  has_many :filter_tags, serializer: ::FilterTagSerializer, embed: :objects

  def filter_tags
    object[:filter_tags]
  end
end
