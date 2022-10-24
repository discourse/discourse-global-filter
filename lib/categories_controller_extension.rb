# frozen_string_literal: true

module GlobalFilter::CategoriesControllerExtension

  def index 
    discourse_expires_in 1.minute

    @description = SiteSetting.site_description

    parent_category = Category.find_by_slug(params[:parent_category_id]) || Category.find_by(id: params[:parent_category_id].to_i)

    include_subcategories = SiteSetting.desktop_category_page_style == "subcategories_with_featured_topics" ||
      params[:include_subcategories] == "true"

    category_options = {
      is_homepage: current_homepage == "categories",
      parent_category_id: params[:parent_category_id],
      include_topics: include_topics(parent_category),
      include_subcategories: include_subcategories,
      tag: params[:tag]
    }

    @category_list = CategoryList.new(guardian, category_options)

    if category_options[:is_homepage] && SiteSetting.short_site_description.present?
      @title = "#{SiteSetting.title} - #{SiteSetting.short_site_description}"
    elsif !category_options[:is_homepage]
      @title = "#{I18n.t('js.filters.categories.title')} - #{SiteSetting.title}"
    end

    respond_to do |format|
      format.html do
        style = SiteSetting.desktop_category_page_style
        topic_options = {
          per_page: CategoriesController.topics_per_page,
          no_definitions: true,
        }

        if style == "categories_and_latest_topics_created_date"
          topic_options[:order] = 'created'
          @topic_list = TopicQuery.new(current_user, topic_options).list_latest
          @topic_list.more_topics_url = url_for(public_send("latest_path", sort: :created))
        elsif style == "categories_and_latest_topics"
          @topic_list = TopicQuery.new(current_user, topic_options).list_latest
          @topic_list.more_topics_url = url_for(public_send("latest_path"))
        elsif style == "categories_and_top_topics"
          @topic_list = TopicQuery.new(current_user, topic_options).list_top_for(SiteSetting.top_page_default_timeframe.to_sym)
          @topic_list.more_topics_url = url_for(public_send("top_path"))
        end

        if @topic_list.present? && @topic_list.topics.present?
          store_preloaded(
            @topic_list.preload_key,
            MultiJson.dump(TopicListSerializer.new(@topic_list, scope: guardian))
          )
        end

        render
      end

      format.json { render_serialized(@category_list, CategoryListSerializer) }
    end
  end
end
