import Component from "@glimmer/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

export default class GlobalFilterComposerDropdown extends Component {
  get content() {
    const filters = this.args.filters;
    filters.forEach((filter) => {
      filter.name = this.tagName(filter);
    });
    return filters;
  }

  get checked() {
    return this.args.selectedTags?.includes(
      this.args.filter.name || this.args.tagParam
    );
  }

  set checked(value) {
    return value;
  }

  tagName(filter) {
    return filter.alternate_name || filter.name?.replace(/-|_/g, " ") || "";
  }

  @action
  toggleTag() {
    if (this.args.selectedTags.includes(this.args.filter.name)) {
      const filterIndex = this.args.selectedTags.indexOf(this.args.filter.name);
      this.args.selectedTags.splice(filterIndex, 1);
    } else {
      this.args.selectedTags.push(this.args.filter.name);
    }

    withPluginApi("1.3.0", (api) => {
      ajax(`/global_filter/filter_tags/categories_for_filter_tags.json`, {
        data: { tags: this.args.selectedTags },
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
}
