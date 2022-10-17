import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { makeArray } from "discourse-common/lib/helpers";

export default class GlobalFilterComposerContainer extends Component {
  @service siteSettings;
  @service router;

  tagParam = this.router.currentRoute?.queryParams?.tag;
  canDisplay =
    this.args.composer.creatingTopic === true &&
    !this.args.composer.creatingPrivateMessage;

  get globalFilters() {
    const filters = this.siteSettings.global_filters;
    if (!filters) {
      return false;
    }
    return filters.split("|");
  }
}
