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
    this.setCategoriesForFilter();
    this.setSelectedContentToFilter();
  },

  modifyComponentForRow() {
    return "global-filter-chooser-row";
  },

  get content() {
    const allFilters = this.site.global_filters;
    const filters = this.loadAdditionalFilters(allFilters);

    // set header selected values
    this.set(
      "selectedContent",
      filters.filter((filterTag) => this.value.includes(filterTag.name))
    );

    // set remaining dropdown content values
    return filters.filter((filterTag) => !this.value.includes(filterTag.name));
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
    const allFilters = this.site.global_filters;
    const filters = this.loadAdditionalFilters(allFilters);
    this.set(
      "selectedContent",
      filters.filter((filterTag) => this.value.includes(filterTag.name))
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
    let filters = [
      ...globalFilters.filter(
        (f) => !["capturing-reality", "fortnite"].includes(f.name)
      ),
      {
        name: "reality-capture",
        icon: "gf-reality-capture",
        alternate_name: null,
        parent: "capturing-reality", // parent property used in unreal-global-filter-chooser-collection.js
      },
      {
        name: "reality-scan",
        icon: "gf-reality-capture",
        alternate_name: null,
        parent: "capturing-reality", // parent property used in unreal-global-filter-chooser-collection.js
      },
    ];

    if (globalFilters.mapBy("name").includes("fortnite")) {
      filters.push(
        {
          name: "fortnite-creative",
          icon: "gf-fortnite-creative",
          alternate_name: null,
          parent: "fortnite", // parent property used in unreal-global-filter-chooser-collection.js
        },
        {
          name: "unreal-editor-for-fortnite",
          icon: "gf-unreal-editor-for-fortnite",
          alternate_name: null,
          parent: "fortnite", // parent property used in unreal-global-filter-chooser-collection.js
        }
      );
    }

    return filters;
  },
});
