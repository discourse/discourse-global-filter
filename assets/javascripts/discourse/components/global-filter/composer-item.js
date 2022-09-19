import Component from "@glimmer/component";
import { action } from "@ember/object";

export default class GlobalFilterComposerItem extends Component {
  spacedTag = this.args.filter.replace(/-|_/g, " ");
  checked;

  constructor() {
    super(...arguments);

    this.checked = this.args.composer.tags?.includes(
      this.args.filter || this.args.tagParam
    )
      ? true
      : false;
  }

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
