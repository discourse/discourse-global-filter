# frozen_string_literal: true

require "rails_helper"

RSpec.describe GlobalFilter::UpdateCategoryStats do
  describe "#perform" do
    it "does not fail if site setting has non-existent tag name" do
      SiteSetting.global_filters = "non-existent"

      expect { GlobalFilter::UpdateCategoryStats.new.perform }.not_to raise_error
    end
  end
end
