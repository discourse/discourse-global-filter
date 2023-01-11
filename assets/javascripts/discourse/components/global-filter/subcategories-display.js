import Component from "@glimmer/component";
import { ajax } from "discourse/lib/ajax";
import { tracked } from "@glimmer/tracking";

export default class SubcategoriesDisplay extends Component {
  @tracked filteredSubcategories;

  constructor() {
    super(...arguments);
    this.loadSubcategories();
  }

  async loadSubcategories() {
    if (!this.args.subcategories) {
      return;
    }

    this.filteredSubcategories = await ajax(
      `/global_filter/filter_tags/categories_for_current_filter.json`
    ).then((model) => {
      const subcategoriesByName = this.args.subcategories.map(
        (item) => item.name
      );
      return model.subcategories.filter((subcategory) =>
        subcategoriesByName.includes(subcategory.name)
      );
    });
  }
}
