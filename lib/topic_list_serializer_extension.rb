# frozen_string_literal: true

module GlobalFilter::TopicListSerializerExtension

  def topics
    if object.topics.any?
      topics_with_tag = []
      object.topics.select do |t|
        topics_with_tag << t if t.tags.where(name: filter_tag).present?
      end
      topics_with_tag
    end
  end
end
