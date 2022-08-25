import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class GlobalFilterComposerItem extends Component {
  checked = this.args.composer.tags?.includes(this.args.filter) ? true : false;
  spacedTag = this.args.filter.replace(/-|_/g, " ");

  @action
  toggleTag() {
    const filterIndex = this.args.composer.tags.indexOf(this.args.filter);
    if (filterIndex >= 0) {
      this.args.composer.tags.pop(filterIndex);
    } else {
      this.args.composer.tags.push(this.args.filter);
    }
  }
}
