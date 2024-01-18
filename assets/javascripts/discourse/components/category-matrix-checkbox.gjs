import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";

export default class CategoryMatrixCheckbox extends Component {
  get isChecked() {
    return this.args.filterTag.categories.some(
      (f) => f.id === this.args.category.id
    );
  }

  @action
  onChange(e) {
    const splitFilterCategoryIds = this.args.filterTag.category_ids;
    let categoryIds =
      splitFilterCategoryIds === ""
        ? []
        : this.args.filterTag.category_ids.split("|").map((str) => Number(str));

    if (e.target.checked) {
      categoryIds.push(this.args.category.id);
    } else {
      categoryIds = categoryIds.filter((c) => c !== this.args.category.id);
    }

    this.args.setCategoryIdsForTag(this.args.filterTag, categoryIds);
  }

  <template>
    <input
      {{on "change" this.onChange}}
      type="checkbox"
      checked={{this.isChecked}}
    />
  </template>
}
