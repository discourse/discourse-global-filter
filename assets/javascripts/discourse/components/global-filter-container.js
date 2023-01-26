import Component from "@glimmer/component";
import { inject as service } from "@ember/service";

export default class GlobalFilterContainer extends Component {
  @service site;

  get globalFilters() {
    return this.site.global_filters;
  }
}
