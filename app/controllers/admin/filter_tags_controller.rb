# frozen_string_literal: true

class GlobalFilter::AdminFilterTagsController < Admin::AdminController

  def index
    render_serialized(
      { filter_tags: GlobalFilter::FilterTag.all },
      GlobalFilter::FilterTagIndexSerializer,
      root: false
    )
  end

  def set_category_ids_for_tag
    params.require(:tag)
    filter_tag = GlobalFilter::FilterTag.find_by(name: params[:tag])
    filter_tag.update!(category_ids: params[:category_ids]&.join("|") || "")
  end

  def set_alternate_name_for_tag
    params.require(:tag)
    filter_tag = GlobalFilter::FilterTag.find_by(name: params[:tag])
    filter_tag.update!(alternate_name: params[:alternate_name] || nil)
  end

  def set_alternate_composer_only_for_tag
    params.require([:tag, :alternate_composer_only])
    filter_tag = GlobalFilter::FilterTag.find_by(name: params[:tag])
    filter_tag.update!(alternate_composer_only: params[:alternate_composer_only] || nil)
  end
end
