import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";

export default class GlobalFilterComposerContainer extends Component {
  @service router;
  @service site;
  @service siteSettings;

  tagParam = this.router.currentRoute?.queryParams?.tag;

  constructor() {
    super(...arguments);

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

  get canDisplay() {
    return (
      (this.args.composer.creatingTopic === true &&
        !this.args.composer.creatingPrivateMessage) ||
      (this.args.composer.editingFirstPost === true &&
        !this.args.composer.privateMessage)
    );
  }

  get globalFilters() {
    return this.site.global_filters;
  }
}
