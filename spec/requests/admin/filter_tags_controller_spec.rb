# frozen_string_literal: true

require "rails_helper"

describe GlobalFilter::FilterTagsController do
  fab!(:admin)
  fab!(:user)
  fab!(:tag)
  fab!(:second_tag) { Fabricate(:tag) }
  fab!(:third_tag) { Fabricate(:tag) }
  fab!(:filter_tag) { Fabricate(:filter_tag, name: tag.name) }

  before { SiteSetting.discourse_global_filter_enabled = true }

  describe "#set_filter_children_for_tag" do
    it "is not accessible to non-staff users" do
      sign_in(user)
      post "/admin/plugins/filter_tags/#{tag.name}/set_filter_children_for_tag.json"
      expect(response.status).to eq(404)
    end

    it "requires a filter child to be passed" do
      sign_in(admin)
      post "/admin/plugins/filter_tags/#{tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: nil,
           }

      expect(response.status).to eq(400)
      expect(response.body).to include("param is missing or the value is empty: child_tag")
    end

    it "requires a filter child to be passed" do
      sign_in(admin)
      post "/admin/plugins/filter_tags/#{tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: nil,
           }

      expect(response.status).to eq(400)
      expect(response.body).to include("param is missing or the value is empty: child_tag")
    end

    it "requires a filter child to be passed" do
      sign_in(admin)
      post "/admin/plugins/filter_tags/#{tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: nil,
           }

      expect(response.status).to eq(400)
      expect(response.body).to include("param is missing or the value is empty: child_tag")
    end

    it "adds the filter child to filter_children" do
      sign_in(admin)
      expect(filter_tag.filter_children).to_not be_present
      post "/admin/plugins/filter_tags/#{tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: second_tag.name,
             icon: "foo",
             alternate_child_tag_name: "foo",
           }

      expect(response.status).to eq(200)
      filter_tag.reload
      expect(filter_tag.filter_children).to be_present
      expect(filter_tag.filter_children).to eq(
        {
          second_tag.name => {
            "alternate_name" => "foo",
            "icon" => "foo",
            "name" => second_tag.name,
            "parent" => filter_tag.name,
          },
        },
      )

      post "/admin/plugins/filter_tags/#{filter_tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: third_tag.name,
             icon: "foo",
             alternate_child_tag_name: "foo",
           }

      filter_tag.reload
      expect(filter_tag.filter_children).to eq(
        {
          second_tag.name => {
            "alternate_name" => "foo",
            "icon" => "foo",
            "name" => second_tag.name,
            "parent" => filter_tag.name,
          },
          third_tag.name => {
            "alternate_name" => "foo",
            "icon" => "foo",
            "name" => third_tag.name,
            "parent" => filter_tag.name,
          },
        },
      )
    end

    it "creating a filter child that already exists replaces itself" do
      sign_in(admin)
      expect(filter_tag.filter_children).to_not be_present
      post "/admin/plugins/filter_tags/#{tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: second_tag.name,
             icon: nil,
             alternate_child_tag_name: nil,
           }

      expect(response.status).to eq(200)
      filter_tag.reload
      expect(filter_tag.filter_children).to eq(
        {
          second_tag.name => {
            "alternate_name" => nil,
            "icon" => nil,
            "name" => second_tag.name,
            "parent" => filter_tag.name,
          },
        },
      )

      post "/admin/plugins/filter_tags/#{filter_tag.name}/set_filter_children_for_tag.json",
           params: {
             child_tag: second_tag.name,
             icon: "foo",
             alternate_child_tag_name: "foo",
           }

      filter_tag.reload
      expect(filter_tag.filter_children).to eq(
        {
          second_tag.name => {
            "alternate_name" => "foo",
            "icon" => "foo",
            "name" => second_tag.name,
            "parent" => filter_tag.name,
          },
        },
      )
    end
  end
end
