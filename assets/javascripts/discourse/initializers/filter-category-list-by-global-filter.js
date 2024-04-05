import { ajax } from "discourse/lib/ajax";
import PreloadStore from "discourse/lib/preload-store";
import CategoryList from "discourse/models/category-list";

export default {
  name: "filter-category-list-by-global-filter",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    const site = container.lookup("service:site");
    if (siteSettings.discourse_global_filter_enabled) {
      CategoryList.reopenClass({
        listCallbacks: [],

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
            const list = CategoryList.create({
              categories: this.categoriesFrom(store, result),
              can_create_category: result.category_list.can_create_category,
              can_create_topic: result.category_list.can_create_topic,
            });

            // adds the global filter to the list object to be used if needed
            list.globalFilter = tagParam;

            // trigger any callbacks that have been registered with the update categories list
            // at the moment this is to update the categories in the sidebar without performing another API call
            this.listCallbacks.forEach((callback) => {
              callback(list);
            });

            return list;
          });
        },
      });
    }
  },
};
