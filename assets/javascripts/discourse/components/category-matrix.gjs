import Component from "@glimmer/component";
import { concat } from "@ember/helper";
import { service } from "@ember/service";
import categoryBadge from "discourse/helpers/category-badge";
import i18n from "discourse-common/helpers/i18n";
import CategoryMatrixCheckbox from "./category-matrix-checkbox";

export default class CategoryMatrix extends Component {
  @service site;

  categoriesSorting = "position";

  filteredCategories =
    this.site.categories.filter(
      (c) =>
        c.id !== this.site.uncategorized_category_id &&
        c.parent_category_id !== this.site.uncategorized_category_id
    ) || [];

  constructor() {
    super(...arguments);

    this.#reorderChildren(null, 0, 0);
  }

  #reorderChildren(categoryId, depth, index) {
    this.filteredCategories.forEach((category) => {
      if (
        (categoryId === null && !category.get("parent_category_id")) ||
        category.get("parent_category_id") === categoryId
      ) {
        category.position = index++;
        category.depth = depth;
        index = this.#reorderChildren(category.get("id"), depth + 1, index);
      }
    });

    return index;
  }

  get categoriesOrdered() {
    return this.filteredCategories.sortBy(this.categoriesSorting);
  }

  <template>
    <table class="sticky-header">
      <thead>
        <tr>
          <th></th>
          {{#each @filterTags as |filterTag|}}
            <th>
              {{filterTag.name}}
            </th>
          {{/each}}
        </tr>
      </thead>
      <tbody>
        {{#each this.categoriesOrdered as |category|}}
          <tr class={{concat "global-filter--c-depth-" category.depth}}>
            <td>
              {{categoryBadge category}}
            </td>

            {{#each @filterTags as |filterTag|}}
              <td>
                <CategoryMatrixCheckbox
                  @filterTag={{filterTag}}
                  @category={{category}}
                  @setCategoryIdsForTag={{@setCategoryIdsForTag}}
                />
              </td>
            {{/each}}
          </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="global-filter--empty-column-note">
      <p>{{i18n "global_filter.admin.empty_note"}}</p>
    </div>
  </template>
}
