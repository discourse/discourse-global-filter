# frozen_string_literal: true

describe "scrolls correctly in categories", type: :system do
  fab!(:support_tag) { Fabricate(:tag, name: "support") }
  fab!(:feature_tag) { Fabricate(:tag, name: "feature") }
  before do
    Fabricate.times(21, :topic, tags: [support_tag])
    Fabricate.times(50, :post, topic: Topic.first)
    SiteSetting.discourse_global_filter_enabled = true
    SiteSetting.global_filters = "support|feature"
    sign_in(Fabricate(:admin))
  end

  def current_scroll_y
    page.evaluate_script("window.scrollY")
  end

  it "scrolls correctly when navigating from categories to topic lists, and remembers scroll position when going back" do
    visit "/"

    expect(page).to have_css(".topic-list-item")
    page.execute_script <<~JS
      document.querySelectorAll('.topic-list-item')[20].scrollIntoView(true);
    JS

    topic_list_scroll_y = current_scroll_y
    try_until_success { expect(topic_list_scroll_y).to be > 0 }

    find(".link-top-line", text: Topic.first.title).click
    try_until_success { expect(current_scroll_y).to eq(0) }

    page.go_back
    try_until_success { expect(current_scroll_y).to eq(topic_list_scroll_y) }

    find("#site-logo").click
    try_until_success { expect(current_scroll_y).to eq(0) }
  end
end
