# frozen_string_literal: true

class GlobalFilter::FilterTagsController < ::ApplicationController

  def assign
    params.require([:tag])
    user = User.find(params[:user_id]) if params[:user_id]

    if user
      custom_field = UserCustomField.find_or_create_by(user_id: params[:user_id], name: "global_filter_preference")
      custom_field.update!(value: params[:tag])
    else
      cookies[:global_filter_pref] = params[:tag]
    end
  end

  def categories_for_current_filter
    render_serialized(CategoryList.new(guardian), CategoryListSerializer, root: false)
  end

  def categories_for_filter_tags
    render_serialized(
      CategoryList.new(guardian),
      CategoryListSerializer,
      root: false,
      tags: params[:tags],
    )
  end
end
