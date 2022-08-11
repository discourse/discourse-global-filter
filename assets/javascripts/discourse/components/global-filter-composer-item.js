import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  classNames: ["global-filter-composer-item"],
  checked: false,

  init() {
    this._super(...arguments);
    this.checked = this.composer.tags.includes(this.filter) ? true : false;
  },

  @action
  toggleTag() {
    const filterIndex = this.composer.tags.indexOf(this.filter);
    if (filterIndex >= 0) {
      this.composer.tags.pop(filterIndex);
    } else {
      this.composer.tags.push(this.filter);
    }
  },
});
