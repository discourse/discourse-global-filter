# frozen_string_literal: true

class GlobalFilter::FilterTagsController < ::ApplicationController
  def assign
    params.require(:tag)

    unless SiteSetting.global_filters.split("|").include?(params[:tag])
      raise Discourse::InvalidParameters
    end
    UserCustomField.upsert(
      {
        user_id: current_user.id,
        name: "global_filter_preference",
        value: params[:tag]
      },
      unique_by: :idx_user_custom_fields_global_filter_preference
    )
  end

  def categories_for_current_filter
    render_serialized(
      CategoryList.new(guardian),
      CategoryListSerializer,
      root: false
    )
  end

  def categories_for_filter_tags
    render_serialized(
      CategoryList.new(guardian),
      CategoryListSerializer,
      root: false,
      tags: params[:tags]
    )
  end
end
