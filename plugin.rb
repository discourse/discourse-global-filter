# frozen_string_literal: true

# name: discourse-global-filter
# about: Global Filters utilizes existing tags to provide top level routing and scoping to a site
# version: 0.0.1
# authors: Discourse
# url: https://github.com/discourse/discourse-global-filter
# required_version: 2.7.0
# transpile_js: true

enabled_site_setting :discourse_global_filter_enabled

register_asset 'stylesheets/common/global-filter.scss'

after_initialize do
  module ::GlobalFilter
    PLUGIN_NAME ||= "discourse-global-filter"
    GLOBAL_FILTER_PREFERENCE ||= 'global_filter_preference'

    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace GlobalFilter
    end
  end

  add_admin_route "global_filter.admin.title", "filter_tags"

  [
    '../app/controllers/filter_tags_controller.rb',
    '../app/controllers/admin/filter_tags_controller.rb',
    '../app/models/filter_tag.rb',
    '../app/serializers/filter_tag_serializer.rb',
    '../app/serializers/filter_tag_index_serializer.rb',
    '../jobs/scheduled/update_category_stats.rb',
    '../lib/category_list_serializer_extension.rb',
    '../lib/category_detailed_serializer_extension.rb',
    '../lib/category_list_extension.rb',
  ].each { |path| load File.expand_path(path, __FILE__) }

  GlobalFilter::Engine.routes.draw do
    put '/filter_tags/:tag/assign' => 'filter_tags#assign'
    get '/filter_tags/categories_for_current_filter' => 'filter_tags#categories_for_current_filter'
    get '/filter_tags/categories_for_filter_tags' => 'filter_tags#categories_for_filter_tags'
  end

  Discourse::Application.routes.prepend do
    mount ::GlobalFilter::Engine, at: '/global_filter'
    get "/admin/plugins/filter_tags" =>
          "global_filter/admin_filter_tags#index",
        :constraints => StaffConstraint.new
    post '/admin/plugins/filter_tags/:tag/set_category_ids_for_tag' =>
           'global_filter/admin_filter_tags#set_category_ids_for_tag',
         :constraints => StaffConstraint.new
    post '/admin/plugins/filter_tags/:tag/set_alternate_name_for_tag' =>
           'global_filter/admin_filter_tags#set_alternate_name_for_tag',
         :constraints => StaffConstraint.new
    post '/admin/plugins/filter_tags/:tag/set_alternate_composer_only_for_tag' =>
           'global_filter/admin_filter_tags#set_alternate_composer_only_for_tag',
         :constraints => StaffConstraint.new
  end

  register_editable_user_custom_field(GlobalFilter::GLOBAL_FILTER_PREFERENCE)
  register_user_custom_field_type(GlobalFilter::GLOBAL_FILTER_PREFERENCE, :string)
  DiscoursePluginRegistry.serialized_current_user_fields << GlobalFilter::GLOBAL_FILTER_PREFERENCE

  reloadable_patch do
    CategoryListSerializer.class_eval { prepend GlobalFilter::CategoryListSerializerExtension }
    CategoryList.class_eval { prepend GlobalFilter::CategoryListExtension }
    CategoryDetailedSerializer.class_eval { prepend GlobalFilter::CategoryDetailedSerializerExtension }
  end

  add_to_serializer(:site, :global_filters) do
    GlobalFilter::FilterTag.all.order(:created_at)
  end

  add_to_serializer(:site, :filter_tags_total_topic_count) do
    counts = {}
    GlobalFilter::FilterTag.find_each do |gft|
      counts[gft.name] = gft.total_topic_count
    end
    counts
  end

  add_to_serializer(:category_detailed, :filter_tag) do
    scope.user&.custom_fields&.dig('global_filter_preference') || scope.request.params[:tag] || GlobalFilter::FilterTag.first.name
  end

  add_to_serializer(:category_detailed, :posts_week) do
    object.global_filter_tags_category_stats[filter_tag]&.fetch("posts_week", 0) || 0
  end

  add_to_serializer(:category_detailed, :most_recent_unpinned_category_topic_for_filter_tag) do
    @most_recent_unpinned_category_topic_for_filter_tag = begin
      tag = Tag.find_by(name: filter_tag)
      Topic
        .joins(:tags)
        .where(category_id: object.id)
        .where("pinned_until IS NULL OR pinned_until < ? ", Time.zone.now)
        .visible
        .where("tags.id IN (?)", tag)
        .order("created_at DESC")
        .first
    end
  end

  add_to_serializer(:category_detailed, :last_poster) do
    user = User.find(most_recent_unpinned_category_topic_for_filter_tag.user_id) if most_recent_unpinned_category_topic_for_filter_tag
    BasicUserSerializer.new(user, root: false)
  end

  add_to_serializer(:category_list, :filter_tag) do
    object.instance_variable_get("@options")&.dig(:tag) || scope.user&.custom_fields&.dig('global_filter_preference') || scope.request.params[:tag] || GlobalFilter::FilterTag.first.name
  end

  add_to_serializer(:category_list, :subcategories) do
    GlobalFilter::FilterTag.categories_for_tags(filter_tag, scope).filter(&:parent_category_id)
  end

  DiscourseEvent.on(:site_setting_changed) do |name, old_value, new_value|
    if name === :global_filters
      old_values = old_value.split("|")
      new_values = new_value.split("|")

      tags_to_destroy = old_values.select { |tag| !new_values.include?(tag) }
      tags_to_create = new_values.select { |tag| !old_values.include?(tag) }

      tags_to_create.each { |tag| GlobalFilter::FilterTag.create!(name: tag) } if tags_to_create.any?
      GlobalFilter::FilterTag.where(name: tags_to_destroy).destroy_all if tags_to_destroy.any?
    end
  end
end
