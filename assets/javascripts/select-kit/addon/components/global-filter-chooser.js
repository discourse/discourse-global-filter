import MultiSelectComponent from "select-kit/components/multi-select";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

export default MultiSelectComponent.extend({
  pluginApiIdentifiers: ["global-filter-chooser"],
  classNames: ["global-filter-chooser"],
  valueProperty: "name",
  selectKitOptions: {
    none: "global_filter.composer_dropdown.none",
  },

  didInsertElement() {
    this._super(...arguments);
    this.setCategoriesForCurrentFilter();
  },

  modifyComponentForRow() {
    return "global-filter-chooser-row";
  },

  get content() {
    return this.site?.global_filters;
  },

  select(value) {
    const updatedValues = [...this.value, value];
    this.updateCategoryDropdown(updatedValues);
    this._super(...arguments);
  },

  deselect(value) {
    const updatedValues = this.value.filter((tag) => tag !== value.name);
    this.updateCategoryDropdown(updatedValues);
    this._super(...arguments);
  },

  updateCategoryDropdown(tags) {
    withPluginApi("1.3.0", (api) => {
      ajax(`/global_filter/filter_tags/categories_for_filter_tags.json`, {
        data: { tags },
      }).then((model) => {
        api
          .modifySelectKit("category-chooser")
          .replaceContent((categoryDrop) => {
            if (!categoryDrop.selectKit.filter) {
              const categoriesAndSubcategories = model.categories.concat(
                model.subcategories
              );
              const filteredSubcategories = categoryDrop.content.filter((c) => {
                const categoriesByName = categoriesAndSubcategories.map(
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
          });
      });
    });
  },

  setCategoriesForCurrentFilter() {
    // update category dropdown with valid values
    withPluginApi("1.3.0", (api) => {
      ajax(
        `/global_filter/filter_tags/categories_for_current_filter.json`
      ).then((model) => {
        api
          .modifySelectKit("category-chooser")
          .replaceContent((categoryDrop) => {
            if (!categoryDrop.selectKit.filter) {
              const categoriesAndSubcategories = model.categories.concat(
                model.subcategories
              );
              const filteredSubcategories = categoryDrop.content.filter((c) => {
                const categoriesByName = categoriesAndSubcategories.map(
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
          });
      });
    });
  },
});
