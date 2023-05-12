import MultiSelectComponent from "select-kit/components/multi-select";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

export default MultiSelectComponent.extend({
  pluginApiIdentifiers: ["global-filter-chooser"],
  classNames: ["global-filter-chooser"],
  valueProperty: "name",
  selectKitOptions: {
    selectedChoiceComponent: "global-filter/selected-choice",
    headerComponent: "global-filter/header",
  },

  didInsertElement() {
    this._super(...arguments);
    this.setCategoriesForFilter();
    this.setSelectedContentToFilter();
  },

  get filtersWithChildren() {
    return this.loadAdditionalFilters(this.site.global_filters);
  },

  get content() {
    if (!this.value) {
      return [];
    }

    // set header selected values
    this.set(
      "selectedContent",
      this.filtersWithChildren.filter((filterTag) =>
        this.value.includes(filterTag.name)
      )
    );

    // set remaining dropdown content values
    return this.filtersWithChildren.filter(
      (filterTag) => !this.value.includes(filterTag.name)
    );
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

  setSelectedContentToFilter() {
    if (!this.value) {
      return [];
    }

    this.set(
      "selectedContent",
      this.filtersWithChildren.filter((filterTag) =>
        this.value.includes(filterTag.name)
      )
    );
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

  setCategoriesForFilter() {
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

  loadAdditionalFilters(globalFilters) {
    let children = [];
    globalFilters.forEach((gf) => {
      gf.filter_children && children.push(...Object.values(gf.filter_children));
    });
    const filters = this.siteSettings.replace_global_filter_with_children
      ? globalFilters.filter((f) => !f.filter_children)
      : globalFilters;
    return [...filters, ...children];
  },

  modifyComponentForRow() {
    return "global-filter-chooser-row";
  },
});
