import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
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

        api.modifyClass("controller:discovery/categories", modification);

        // TODO: Remove once https://github.com/discourse/discourse/pull/22622 is merged
        api.modifyClass("controller:tag-show", modification);

        const owner = api.container.owner;
        if (owner.resolveRegistration("controller:discovery/list")) {
          // TODO: remove conditional once https://github.com/discourse/discourse/pull/22622 is merged
          api.modifyClass("controller:discovery/list", modification);
        }
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

        if (!categoryDrop.selectKit.filter) {
          const categoryDropParentClasslist = document.getElementById(
            categoryDrop.elementId
          ).parentElement.classList;

          if (
            categoryDropParentClasslist.contains("gft-parent-categories-drop")
          ) {
            return categoriesAndSubcategories.categories;
          }

          if (categoryDropParentClasslist.contains("gft-subcategories-drop")) {
            const filteredSubcategories = categoryDrop.content.filter((c) => {
              const categoriesByName =
                categoriesAndSubcategories.subcategories.map(
                  (item) => item["name"]
                );

              return categoriesByName.includes(
                c.name ||
                  categoryDrop.allCategoriesLabel ||
                  categoryDrop.noCategoriesLabel
              );
            });
            return filteredSubcategories;
          }
        }
      });
    }
  );
}
