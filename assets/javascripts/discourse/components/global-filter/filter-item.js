import Component from "@glimmer/component";
import { defaultHomepage } from "discourse/lib/utilities";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class GlobalFilterFilterItem extends Component {
  @service site;
  @service siteSettings;

  @tracked spacedTag = this.args.filter.replace(/-|_/g, " ");

  get totalFilterTagCount() {
    const count = this.site.filter_tags_total_topic_count[this.args.filter];
    const defaultLocale =
      this.siteSettings.default_locale?.replace(/_/g, "-") || "en-US";

    return count.toLocaleString(defaultLocale);
  }

  constructor() {
    super(...arguments);
    this.route =
      defaultHomepage() === "categories"
        ? `/categories?tag=${this.args.filter}`
        : `/tag/${this.args.filter}`;
  }
}
