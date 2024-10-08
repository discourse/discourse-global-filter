import { hash } from "@ember/helper";
import PluginOutlet from "discourse/components/plugin-outlet";
import CategoryDrop from "select-kit/components/category-drop";

const FilteredCategoriesChooser = <template>
  {{#unless @editingCategory}}
    {{#each @categoryBreadcrumbs as |breadcrumb|}}
      {{#if breadcrumb.hasOptions}}
        <li
          class="filtered-category-drop
            {{if
              breadcrumb.isSubcategory
              'gft-subcategories-drop'
              'gft-parent-categories-drop'
            }}"
        >
          <PluginOutlet
            @name="before-filtered-category-drop"
            @outletArgs={{hash category=breadcrumb.category}}
          />
          <CategoryDrop
            @category={{breadcrumb.category}}
            @categories={{breadcrumb.options}}
            @tagId={{@tagId}}
            @editingCategory={{@editingCategory}}
            @editingCategoryTab={{@editingCategoryTab}}
            @options={{hash
              parentCategory=breadcrumb.parentCategory
              subCategory=breadcrumb.isSubcategory
              noSubcategories=breadcrumb.noSubcategories
              autoFilterable=true
            }}
          />
        </li>
      {{/if}}
    {{/each}}
  {{/unless}}
</template>;

export default FilteredCategoriesChooser;
