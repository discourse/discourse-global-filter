import Component from "@glimmer/component";
import { defaultHomepage } from "discourse/lib/utilities";

export default class GlobalFilterFilterItem extends Component {
  spacedTag = this.args.filter.replace(/-|_/g, " ");

  constructor() {
    super(...arguments);
    this.route =
      defaultHomepage() === "categories"
        ? `/categories?tag=${this.args.filter}`
        : `/tag/${this.args.filter}`;
  }
}
