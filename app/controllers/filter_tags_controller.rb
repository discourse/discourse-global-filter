# frozen_string_literal: true

class GlobalFilter::FilterTagsController < ::ApplicationController
  requires_login

  def assign
    params.require([:user_id, :tag])
    user = User.find(params[:user_id])

    custom_field = UserCustomField.find_or_create_by(user_id: params[:user_id], name: "global_filter_preference")
    custom_field.update!(value: params[:tag])
  end

  def categories_for_global_filter
    render_serialized(CategoryList.new(guardian, tag: "a-tag-for-all-our-fr", include_topics: true), CategoryListSerializer, root: false)
  end
end
