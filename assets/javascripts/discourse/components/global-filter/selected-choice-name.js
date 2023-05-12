import Component from "@glimmer/component";
import { escapeExpression } from "discourse/lib/utilities";

export default class GlobalFilterSelectedChoiceName extends Component {
  get displayName() {
    if (this.args.item.alternate_name) {
      return this.args.item.alternate_name.replace(/-/g, " ");
    }

    return this.args.item.name.replace(/-/g, " ");
  }

  get icon() {
    return escapeExpression(this.args.item.icon) || `gf-${this.args.item.name}`;
  }
}
