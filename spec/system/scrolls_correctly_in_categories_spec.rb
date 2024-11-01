# frozen_string_literal: true

describe "scrolls correctly in categories", type: :system, requires: [:scroll], focus_: true do
  let(:topic_list) { PageObjects::Components::TopicList.new }

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
    SiteSetting.global_filters = "support|feature"
    sign_in(Fabricate(:admin))
  end

  def current_scroll_y
    page.evaluate_script("window.scrollY")
  end

  it "scrolls correctly when navigating from categories to topic lists, and remembers scroll position when going back" do
    visit "/"

    expect(topic_list).to have_topics
    topic_list_scroll_y = current_scroll_y

    try_until_success { expect(topic_list_scroll_y).to eq(0) }

    sleep 1
    topic_list.visit_topic(Topic.first)

    try_until_success do
      page.scroll_to(find(".powered-by-discourse"))
      expect(current_scroll_y).to be > 0
    end

    page.go_back
    try_until_success { expect(current_scroll_y).to eq(topic_list_scroll_y) }

    find("#site-logo").click
    try_until_success { expect(current_scroll_y).to eq(0) }
  end
end
