import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import EmberObject from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class GlobalFilterContainer extends Component {
  @service router;
  @service siteSettings;

  @tracked globalFilters;

  constructor() {
    super(...arguments);
    this.loadGlobalFilters();
  }

  async loadGlobalFilters() {
    if (
      !this.siteSettings.global_filters ||
      this.router.currentRouteName.startsWith("admin")
    ) {
      return false;
    }

    this.globalFilters = await ajax("/global_filter/filter_tags.json").then(
      (model) => {
        model = model.filter_tags.map((filter_tag) =>
          EmberObject.create(filter_tag)
        );
        return model;
      }
    );
  }
}
