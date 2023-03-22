# frozen_string_literal: true

module Jobs
  class ::GlobalFilter::UpdateGlobalFilterTopicsByCategoryTags < ::Jobs::Scheduled
    every 10.minutes

    def execute(args = nil)
      tags = Tag.where(name: SiteSetting.global_filters.split("|"))

      puts Category.includes(:global_filter_topics_by_category_tag).inspect
      Category.includes(:global_filter_topics_by_category_tag).all.each do |category|
        topic_tag_mapping = tags.each_with_object({}) do |tag, hash|
          topic = ::GlobalFilter::GlobalFilterTopicsByCategoryTag
            .most_recent_unpinned_topic_for(category_id: category.id, tag_id: tag.id)

          next if topic.nil?

          hash[tag.name] = {
            title: topic.title,
            url: topic.url,
            created_at: topic.created_at,
            user: {
              username: topic.user.username,
              avatar_template: topic.user.small_avatar_url
            }
          }
        end

        category.build_global_filter_topics_by_category_tag if category.global_filter_topics_by_category_tag.nil?
        category.global_filter_topics_by_category_tag.update(topic_tag_mapping: topic_tag_mapping)
      end
    end
  end
end
