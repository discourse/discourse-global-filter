# frozen_string_literal: true

module GlobalFilter::CategoryGuardianExtension
  def secure_categories_for_filter_tags_ids(filter_tags)
    @secure_categories_for_filter_tag_ids ||= {}
    @secure_categories_for_filter_tag_ids[
      filter_tags
    ] ||= GlobalFilter::FilterTag.categories_for_tags(filter_tags, self).pluck(:id)
  end
end
