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
  PLUGIN_NAME = "discourse-global-filter"
end
