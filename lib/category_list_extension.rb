# frozen_string_literal: true

module GlobalFilter::CategoryListExtension
  def preload_key
    @options[:tag] ? "categories_list_#{@options[:tag]}" : "categories_list"
  end
end
