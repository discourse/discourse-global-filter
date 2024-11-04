# frozen_string_literal: true

describe "global filter routing", type: :system do
  fab!(:support_tag) { Fabricate(:tag, name: "support") }
  fab!(:feature_tag) { Fabricate(:tag, name: "feature") }

  fab!(:topic) { Fabricate(:topic, tags: [support_tag]) }

  fab!(:first_post) { Fabricate(:post, topic: topic) }
  fab!(:second_post) { Fabricate(:post, topic: topic, post_number: 2) }
  fab!(:third_post) { Fabricate(:post, topic: topic, post_number: 3) }
  fab!(:fourth_post) { Fabricate(:post, topic: topic, post_number: 4) }
  fab!(:fifth_post) { Fabricate(:post, topic: topic, post_number: 5) }

  before do
    SiteSetting.discourse_global_filter_enabled = true
    SiteSetting.global_filters = "feature|support"
    sign_in(Fabricate(:admin))
  end

  # Same test as https://github.com/discourse/discourse-global-filter/pull/125 but now in ruby
  it "uses stored global filter preference at /" do
    SiteSetting.top_menu = "categories|latest|new"
    expect(SiteSetting.homepage).to eq("categories")

    visit("/categories?tag=feature")

    expect(page).to have_current_path("/categories?tag=feature")

    visit("/")

    expect(page).to have_current_path("/categories?tag=feature")

    expect(page).to have_css("body.global-filter-tag-feature")
  end
end
