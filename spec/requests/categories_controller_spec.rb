# frozen_string_literal: true

RSpec.describe CategoriesController do
  fab!(:user) { Fabricate(:user) }
  fab!(:category) { Fabricate(:category) }
  fab!(:category_2) { Fabricate(:category) }
  fab!(:category_2_subcategory) { Fabricate(:category, parent_category_id: category_2.id) }
  fab!(:filter_tag) { Fabricate(:filter_tag) }
  fab!(:filter_tag_2) { Fabricate(:filter_tag) }

  before do
    filter_tag.update(category_ids: [category.id, category_2.id, category_2_subcategory.id].join("|"))
    filter_tag_2.update(category_ids: [category_2.id].join("|"))
    sign_in(user)
  end

  describe '#categories_and_topics' do
    it 'assigns the correct preload_key' do
      list = CategoryList.new(Guardian.new(user), { tag: filter_tag_2.name })
      expect(list.preload_key).to eq("categories_list_#{filter_tag_2.name}")
    end

    it 'renders the correct list of categories for tag' do
      get "/categories.json?tag=#{filter_tag_2.name}"
      json = response.parsed_body

      category_list = json['category_list']
      expect(category_list['categories'].size).to eq(1)
      expect(category_list['subcategories'].size).to eq(0)
    end

    it 'does not leak categories after switching GFT' do
      get "/categories.json?tag=#{filter_tag.name}"
      json = response.parsed_body

      category_list = json['category_list']
      expect(category_list['categories'].size).to eq(2)
      expect(category_list['subcategories'].size).to eq(1)

      get "/categories.json?tag=#{filter_tag_2.name}"
      json = response.parsed_body

      category_list = json['category_list']
      expect(category_list['categories'].size).to eq(1)
      expect(category_list['subcategories'].size).to eq(0)
    end
  end
end
