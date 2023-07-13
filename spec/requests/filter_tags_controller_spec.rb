# frozen_string_literal: true

require "rails_helper"

describe GlobalFilter::FilterTagsController do
  describe "#assign" do
    let(:user) { Fabricate(:user) }
    let(:tag) { Fabricate(:tag) }
    let(:tag_2) { Fabricate(:tag) }

    it "creates global_filter_preference if tag is valid global-filter and if preference does not exist" do
      SiteSetting.global_filters = tag.name
      sign_in(user)
      expect(user.custom_fields).to be_empty
      put "/global_filter/filter_tags/#{tag.name}/assign.json"
      expect(response).to be_successful
      expect(user.reload.custom_fields[:global_filter_preference]).to eq(tag.name)
    end

    it "updates global_filter_preference if preference exists" do
      SiteSetting.global_filters = tag_2.name
      sign_in(user)
      UserCustomField.create(user: user, name: "global_filter_preference", value: tag.name)
      put "/global_filter/filter_tags/#{tag_2.name}/assign.json"
      expect(response).to be_successful
      expect(user.reload.custom_fields[:global_filter_preference]).to eq(tag_2.name)
    end

    it "raises error if tag is not a valid global-filter" do
      sign_in(user)
      expect(user.custom_fields).to be_empty
      put "/global_filter/filter_tags/#{tag.name}/assign.json"
      expect(response).to_not be_successful
      expect(user.custom_fields).to be_empty
    end
  end
end
