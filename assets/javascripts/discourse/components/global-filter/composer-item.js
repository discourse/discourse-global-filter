import Component from "@glimmer/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import { inject as service } from "@ember/service";

export default class GlobalFilterComposerItem extends Component {
  @service siteSettings;

  constructor() {
    super(...arguments);

    if (
      this.siteSettings.camelized_composer_tags
        .split("|")
        .includes(this.args.filter)
    ) {
      this.spacedTag = this.args.filter.replace(/-([a-z])/g, (g) => {
        return g[1].toUpperCase();
      });
    } else {
      this.spacedTag = this.args.filter.replace(/-|_/g, " ");
    }
  }

  get checked() {
    return this.args.composer.tags?.includes(
      this.args.filter || this.args.tagParam
    );
  }

  set checked(value) {
    return value;
  }

  @action
  toggleTag() {
    if (this.args.composer.tags.includes(this.args.filter)) {
      const filterIndex = this.args.composer.tags.indexOf(this.args.filter);
      this.args.composer.tags.splice(filterIndex, 1);
    } else {
      this.args.composer.tags.push(this.args.filter);
    }

    withPluginApi("1.3.0", (api) => {
      ajax(`/global_filter/filter_tags/categories_for_filter_tags.json`, {
        data: { tags: this.args.composer.tags },
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
