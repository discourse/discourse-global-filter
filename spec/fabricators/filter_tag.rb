# frozen_string_literal: true

Fabricator(:filter_tag, from: ::GlobalFilter::FilterTag) do
  name { Fabricate(:tag).name }
  category_ids { "1|2" }
end
