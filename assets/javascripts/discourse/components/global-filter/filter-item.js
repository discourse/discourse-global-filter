import Component from "@glimmer/component";
import { defaultHomepage } from "discourse/lib/utilities";
import { inject as service } from "@ember/service";

export default class GlobalFilterFilterItem extends Component {
  @service site;
  @service siteSettings;

  get totalFilterTagCount() {
    const count =
      this.site.filter_tags_total_topic_count[this.args.filter.name];
    const defaultLocale =
      this.siteSettings.default_locale?.replace(/_/g, "-") || "en-US";

    return count.toLocaleString(defaultLocale);
  }

  get route() {
    return defaultHomepage() === "categories"
      ? `/categories?tag=${this.args.filter.name}`
      : `/tag/${this.args.filter.name}`;
  }

  get tagName() {
    // return alternate name if present otherwise return spaced tag
    return this.args.filter.alternate_name &&
      !this.args.filter.alternate_composer_only
      ? this.args.filter.alternate_name
      : this.args.filter.name.replace(/-|_/g, " ");
  }
}
