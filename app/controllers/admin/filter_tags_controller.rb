# frozen_string_literal: true

class GlobalFilter::AdminFilterTagsController < Admin::AdminController

  def index
    render_serialized(
      { filter_tags: GlobalFilter::FilterTag.all.order(:name) },
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

  def set_filter_children_for_tag
    params.require([:tag, :child_tag])
    params.permit([:alternate_child_tag_name, :icon])

    filter_tag = GlobalFilter::FilterTag.find_by(name: params[:tag])
    updated_children = {
      params[:child_tag] => {
        name: params[:child_tag],
        parent: params[:tag],
        icon: params[:icon] || nil,
        alternate_name: params[:alternate_child_tag_name] || nil,
      }
    }
    filter_tag.update!(filter_children: filter_tag.filter_children.merge(updated_children))

    render_serialized(
      { filter_tags: GlobalFilter::FilterTag.all.order(:name) },
      GlobalFilter::FilterTagIndexSerializer,
      root: false
    )
  end

  def delete_filter_child_for_tag
    params.require([:tag, :child_tag])

    filter_tag = GlobalFilter::FilterTag.find_by(name: params[:tag])
    filter_tag.filter_children.delete(params[:child_tag])
    filter_tag.update!(filter_children: filter_tag.filter_children)

    render_serialized(
      { filter_tags: GlobalFilter::FilterTag.all.order(:name) },
      GlobalFilter::FilterTagIndexSerializer,
      root: false
    )
  end
end
