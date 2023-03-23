# frozen_string_literal: true

module GlobalFilter::CategoryExtension
  extend ActiveSupport::Concern

  prepended do
    has_one :global_filter_topics_by_category_tag, class_name: "GlobalFilter::GlobalFilterTopicsByCategoryTag", dependent: :destroy
  end
end
