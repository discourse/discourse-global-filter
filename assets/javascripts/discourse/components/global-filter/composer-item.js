import Component from "@glimmer/component";
import { action } from "@ember/object";
import { makeArray } from "discourse-common/lib/helpers";
import { inject as service } from "@ember/service";

export default class GlobalFilterComposerItem extends Component {
  @service router;

  checked;
  spacedTag = this.args.filter.replace(/-|_/g, " ");

  constructor() {
    super(...arguments);

    const tagParam = this.router.currentRoute?.queryParams?.tag;
    if (tagParam) {
      const composer = this.args.composer;
      if (composer.tags) {
        if (composer.tags.includes(tagParam)) {
          composer.tags.push(tagParam);
        }
      } else {
        this.args.composer.set("tags", makeArray(tagParam));
      }
    }

    this.checked = this.args.composer.tags?.includes(
      this.args.filter || tagParam
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
