# frozen_string_literal: true

Fabricator(
  :global_filter_topics_by_category_tag,
  from: ::GlobalFilter::GlobalFilterTopicsByCategoryTag,
) do
  category_id { Fabricate(:category).id }
  category_ids { "1|2" }
end
