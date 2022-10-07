import Component from "@glimmer/component";
import { defaultHomepage } from "discourse/lib/utilities";
import { inject as service } from "@ember/service";

export default class GlobalFilterFilterItem extends Component {
  @service site;

  spacedTag = this.args.filter.replace(/-|_/g, " ");
  totalFilterTagCount =
    this.site.filter_tags_total_topic_count[this.args.filter];

  constructor() {
    super(...arguments);
    this.route =
      defaultHomepage() === "categories"
        ? `/categories?tag=${this.args.filter}`
        : `/tag/${this.args.filter}`;
  }
}
