import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  tagName: "",

  get handleChecked() {
    return this.filterTag.categories.some(
      (f) => f.id === this.category.get("id")
    );
  },

  set handleChecked(value) {
    return value;
  },

  @action
  onChange(e) {
    let categoryIds = this.filterTag.category_ids
      .split("|")
      .map((str) => Number(str));

    if (e.target.checked) {
      categoryIds.push(this.category.get("id"));
    } else {
      categoryIds = categoryIds.filter((c) => c !== this.category.get("id"));
    }

    this.setCategoryIdsForTag(this.filterTag, categoryIds);
  },
});
