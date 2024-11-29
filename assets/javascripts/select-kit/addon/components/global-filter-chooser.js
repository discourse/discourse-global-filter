import { computed } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import MultiSelectComponent from "select-kit/components/multi-select";
import {
  pluginApiIdentifiers,
  selectKitOptions,
} from "select-kit/components/select-kit";

@selectKitOptions({
  selectedChoiceComponent: "global-filter/selected-choice",
  headerComponent: "global-filter/header",
})
@pluginApiIdentifiers("global-filter-chooser")
@classNames("global-filter-chooser")
export default class GlobalFilterChooser extends MultiSelectComponent {
  valueProperty = "name";

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.setCategoriesForFilter();
  }

  get filtersWithChildren() {
    return this.loadAdditionalFilters(this.site.global_filters);
  }

  @computed("value.[]", "content.[]", "filtersWithChildren.[]")
  get selectedContent() {
    if (!this.value) {
      return [];
    }

    return this.filtersWithChildren.filter((filterTag) =>
      this.value.includes(filterTag.name)
    );
  }

  get content() {
    if (!this.value) {
      return [];
    }

    // set remaining dropdown content values
    return this.filtersWithChildren.filter(
      (filterTag) => !this.value.includes(filterTag.name)
    );
  }

  select(value) {
    const updatedValues = [...this.value, value];
    this.updateCategoryDropdown(updatedValues);
    super.select(...arguments);
  }

  deselect(value) {
    const updatedValues = this.value.filter((tag) => tag !== value.name);
    this.updateCategoryDropdown(updatedValues);
    super.deselect(...arguments);
  }

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
  }

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
  }

  loadAdditionalFilters(globalFilters) {
    let children = [];
    globalFilters.forEach((gf) => {
      gf.filter_children && children.push(...Object.values(gf.filter_children));
    });
    const filters = this.siteSettings.replace_global_filter_with_children
      ? globalFilters.filter((f) => !f.filter_children)
      : globalFilters;
    return [...filters, ...children];
  }

  modifyComponentForRow() {
    return "global-filter-chooser-row";
  }
}
