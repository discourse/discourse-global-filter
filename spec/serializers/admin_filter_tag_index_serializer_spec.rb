# frozen_string_literal: true

require "rails_helper"

RSpec.describe GlobalFilter::AdminFilterTagIndexSerializer do

  let(:filter_tag) { Fabricate(:filter_tag) }
  let(:admin) { Fabricate(:admin) }

  before do
    category_1 = Fabricate(:category).id
    category_2 = Fabricate(:category).id
    filter_tag.update(category_ids: [category_1, category_2].join("|"))
  end

  it "includes filter_tags" do
    json = GlobalFilter::AdminFilterTagIndexSerializer.new(filter_tags: [filter_tag], scope: Guardian.new(admin), root: false).as_json
    filter_tag_response = json[:admin_filter_tag_index][:filter_tags]
    expect(filter_tag_response.pluck(:id)).to eq([filter_tag.id])
    expect(filter_tag_response.pluck(:name)).to eq([filter_tag.name])
    expect(filter_tag_response.pluck(:category_ids)).to eq([filter_tag.category_ids])
  end

  it "includes categories for filter_tags" do
    json = GlobalFilter::AdminFilterTagIndexSerializer.new(filter_tags: [filter_tag], scope: Guardian.new(admin), root: false).as_json
    filter_tag_response = json[:admin_filter_tag_index][:filter_tags][0]
    expect(filter_tag_response[:categories].pluck(:id)).to eq(filter_tag[:category_ids].split("|").map(&:to_i))
  end
end
