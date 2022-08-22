# frozen_string_literal: true

# name: discourse-global-filter
# about: TODO
# version: 0.0.1
# authors: Discourse
# url: TODO
# required_version: 2.7.0
# transpile_js: true

enabled_site_setting :discourse_global_filter_enabled

register_asset 'stylesheets/common/global-filter.scss'

after_initialize do
  require_dependency "topic_query"

  module ::GlobalFilter
    PLUGIN_NAME ||= "discourse-global-filter"
    GLOBAL_FILTER_PREFERENCE ||= 'global_filter_preference'

    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace GlobalFilter
    end
  end

  [
    '../app/controllers/filter_tags_controller.rb',
  ].each { |path| load File.expand_path(path, __FILE__) }

  GlobalFilter::Engine.routes.draw do
    put '/filter_tags/:tag/assign' => 'filter_tags#assign'
  end

  Discourse::Application.routes.prepend do
    mount ::GlobalFilter::Engine, at: '/global_filter'
  end

  register_editable_user_custom_field(GlobalFilter::GLOBAL_FILTER_PREFERENCE)
  register_user_custom_field_type(GlobalFilter::GLOBAL_FILTER_PREFERENCE, :string)
  DiscoursePluginRegistry.serialized_current_user_fields << GlobalFilter::GLOBAL_FILTER_PREFERENCE
end

