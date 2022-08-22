import Component from "@glimmer/component";
import { inject as service } from "@ember/service";

export default class GlobalFilterComposerContainer extends Component {
  @service siteSettings;

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
