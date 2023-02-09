# frozen_string_literal: true

class GlobalFilter::AdminFilterTagsController < Admin::AdminController

  def index
    render_serialized(
    { filter_tags: GlobalFilter::FilterTag.all.order(:name) },
      GlobalFilter::AdminFilterTagIndexSerializer,
      root: false
    )
  end

  def set_category_ids_for_tag
    params.require([:tag])
    filter_tag = GlobalFilter::FilterTag.find_by(name: params[:tag])
    filter_tag.update!(category_ids: params[:category_ids]&.join("|") || "")
  end
end
