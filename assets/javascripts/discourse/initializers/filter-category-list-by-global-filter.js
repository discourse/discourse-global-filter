import CategoryList from "discourse/models/category-list";
import PreloadStore from "discourse/lib/preload-store";
import { ajax } from "discourse/lib/ajax";

export default {
  name: "filter-category-list-by-global-filter",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    const site = container.lookup("service:site");
    if (siteSettings.discourse_global_filter_enabled) {
      CategoryList.reopenClass({
        list(store) {
          const tagParam =
            new URLSearchParams(window.location.search).get("tag") ||
            site.globalFilter;
          // Since core makes an additional ajax call to /categories
          // we need to override the list function to pass a tag parameter
          // so that we serve filtered (by GFT) categories
          const getCategories = () => ajax(`/categories.json?tag=${tagParam}`);
          return PreloadStore.getAndRemove(
            "categories_list",
            getCategories
          ).then((result) => {
            return CategoryList.create({
              categories: this.categoriesFrom(store, result),
              can_create_category: result.category_list.can_create_category,
              can_create_topic: result.category_list.can_create_topic,
            });
          });
        },
      });
    }
  },
};
