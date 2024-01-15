import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import { ALL_CATEGORIES_ID } from "select-kit/components/category-drop";

const PLUGIN_ID = "discourse-global-filter-category-drop-options";

export default {
  name: "set-category-drop-options",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    if (siteSettings.discourse_global_filter_enabled) {
      withPluginApi("1.3.0", (api) => {
        const modification = {
          pluginId: PLUGIN_ID,

          init() {
            this._super(...arguments);
            setCategoryDropOptionsPerGlobalFilter(api);
          },
        };

        api.modifyClass("controller:discovery/categories", { ...modification });

        api.modifyClass("controller:discovery/list", { ...modification });
      });
    }
  },
};

function setCategoryDropOptionsPerGlobalFilter(api) {
  let categoriesAndSubcategories = {};

  ajax("/global_filter/filter_tags/categories_for_current_filter.json").then(
    (model) => {
      categoriesAndSubcategories = {
        categories: model.categories || [],
        subcategories: model.subcategories || [],
      };

      api.modifySelectKit("category-drop").replaceContent((categoryDrop) => {
        if (
          (categoryDrop.value && !categoryDrop.editingCategory) ||
          (categoryDrop.selectKit.options.noSubcategories &&
            categoryDrop.selectKit.options.subCategory)
        ) {
          const allCategoriesDefault = {
            id: ALL_CATEGORIES_ID,
            name: categoryDrop.allCategoriesLabel,
          };
          categoriesAndSubcategories.categories = [
            allCategoriesDefault,
            ...categoriesAndSubcategories.categories,
          ];
          categoriesAndSubcategories.subcategories = [
            allCategoriesDefault,
            ...categoriesAndSubcategories.subcategories,
          ];
        }

        let content = categoryDrop.content || [];
        if (categoryDrop.selectKit.filter) {
          const filter = categoryDrop.selectKit.filter.toLowerCase();

          content = content.filter((c) => {
            const name = categoryDrop.getName(c)?.toLowerCase();
            return name?.includes(filter);
          });
        }

        const categoryDropParentClasslist = document.getElementById(
          categoryDrop.elementId
        ).parentElement.classList;

        const isParentCategoryDrop = categoryDropParentClasslist.contains(
          "gft-parent-categories-drop"
        );
        if (isParentCategoryDrop) {
          const filteredCategories = content.filter((c) => {
            const categoriesByName = categoriesAndSubcategories.categories.map(
              (item) => item.name
            );

            return categoriesByName.includes(
              c.name ||
                categoryDrop.allCategoriesLabel ||
                categoryDrop.noCategoriesLabel
            );
          });
          return filteredCategories;
        }

        const isSubcategoriesDrop = categoryDropParentClasslist.contains(
          "gft-subcategories-drop"
        );
        if (isSubcategoriesDrop) {
          const filteredSubcategories = content.filter((c) => {
            const categoryNames = categoriesAndSubcategories.subcategories.map(
              (item) => item.name
            );

            return categoryNames.includes(
              c.name ||
                categoryDrop.allCategoriesLabel ||
                categoryDrop.noCategoriesLabel
            );
          });
          return filteredSubcategories;
        }
      });
    }
  );
}
