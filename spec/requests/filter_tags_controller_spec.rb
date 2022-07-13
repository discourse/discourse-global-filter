# frozen_string_literal: true

require 'rails_helper'

describe GlobalFilter::FilterTagsController do
  describe "#assign" do
    let(:user) { Fabricate(:user) }
    let(:tag) { Fabricate(:tag) }
    let(:tag_2) { Fabricate(:tag) }

    it "creates global_filter_preference if one does not exist" do
      sign_in(user)
      expect(user.custom_fields).to be_empty
      put "/global_filter/filter_tags/#{tag.name}/assign.json", params: { user_id: user.id }
      expect(response).to be_successful
      expect(user.reload.custom_fields[:global_filter_preference]).to eq(tag.name)
    end

    it "updates global_filter_preference if it exists" do
      sign_in(user)
      UserCustomField.create(user: user, name: "global_filter_preference", value: tag.name)
      put "/global_filter/filter_tags/#{tag_2.name}/assign.json", params: { user_id: user.id }
      expect(response).to be_successful
      expect(user.reload.custom_fields[:global_filter_preference]).to eq(tag_2.name)
    end
  end
end
