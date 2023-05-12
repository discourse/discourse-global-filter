# frozen_string_literal: true

class GlobalFilter::FilterTagIndexSerializer < ApplicationSerializer
  has_many :filter_tags, serializer: ::FilterTagDetailedSerializer, embed: :objects

  def filter_tags
    object[:filter_tags]
  end
end
