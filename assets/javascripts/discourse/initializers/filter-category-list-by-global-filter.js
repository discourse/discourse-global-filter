import { computed } from "@ember/object";
import { getOwner } from "@ember/owner";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import PreloadStore from "discourse/lib/preload-store";
import CategoryList from "discourse/models/category-list";

const PLUGIN_ID = "discourse-global-filter";
const NAME = "filter-category-list-by-global-filter";

export default {
  name: NAME,

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    const site = container.lookup("service:site");
    if (siteSettings.discourse_global_filter_enabled) {
      withPluginApi("1.3.0", (api) => {
        api.modifyClass("model:category", {
          pluginId: `${PLUGIN_ID}:${NAME}`,

          @computed("site.categories.[]", "subcategory_list")
          get subcategories() {
            // the global filter plugin returns a filtered list of subcategories
            // so we need to override the subcategories getter to use the filtered list provided
            return this.subcategory_list?.map((c) => {
              const store = getOwner(this).lookup("service:store");

              const category = store.createRecord("category", c);

              // since we're reloading the model data anyway, it doesn't hurt to update the cache
              // this also will work if lazy loading is enabled
              site.updateCategory(category);

              return category;
            });
          },
        });

        api.modifyClassStatic("model:category-list", {
          pluginId: `${PLUGIN_ID}:${NAME}`,

          globalFilterListCallbacks: [],

          list(store) {
            const tagParam =
              new URLSearchParams(window.location.search).get("tag") ||
              site.globalFilter;
            // Since core makes an additional ajax call to /categories
            // we need to override the list function to pass a tag parameter
            // so that we serve filtered (by GFT) categories
            const getCategories = () =>
              ajax(`/categories.json?tag=${tagParam}`);
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
              this.globalFilterListCallbacks.forEach((callback) => {
                callback(list);
              });

              return list;
            });
          },
        });
      });
    }
  },
};
