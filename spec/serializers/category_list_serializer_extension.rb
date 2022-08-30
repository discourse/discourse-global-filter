# frozen_string_literal: true

require "rails_helper"

RSpec.describe GlobalFilter::CategoryListSerializerExtension do

  fab!(:user) { Fabricate(:user) }
  fab!(:private_category) { Fabricate(:private_category, group: Fabricate(:group)) }
  fab!(:category) { Fabricate(:category) }
  fab!(:filter_tag) { Fabricate(:filter_tag) }

  before do
    filter_tag.update(category_ids: [category.id, private_category.id].join("|"))
  end

  it "only includes categories allowed per permissions" do
    json = CategoryListSerializer.new(CategoryList.new, scope: Guardian.new(user), root: false).as_json
    expect(json[:categories].pluck(:id)).to eq([category.id])
  end
end
