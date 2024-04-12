import { computed } from "@ember/object";
import { getOwner } from "@ember/owner";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import PreloadStore from "discourse/lib/preload-store";
import CategoryList from "discourse/models/category-list";
import { getOwnerWithFallback } from "discourse-common/lib/get-owner";

const PLUGIN_ID = "discourse-global-filter";
const NAME = "filter-category-list-by-global-filter";

export default {
  name: NAME,
  before: "inject-discourse-objects",

  initialize() {
    withPluginApi("1.3.0", (api) => {
      api.modifyClass("model:category", {
        pluginId: `${PLUGIN_ID}:${NAME}`,

        @computed("subcategory_list.[]")
        get subcategories() {
          const site = getOwner(this).lookup("service:site");
          const store = getOwner(this).lookup("service:store");

          // the global filter plugin returns a filtered list of subcategories
          // so we need to override the subcategories getter to use the filtered list provided
          return this.subcategory_list?.map((c) => {
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

        globalFilterQueryParam() {
          return new URLSearchParams(window.location.search).get("tag");
        },

        list(store) {
          const site = getOwnerWithFallback(this).lookup("service:site");
          const tagParam = this.globalFilterQueryParam() || site.globalFilter;

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
            this.globalFilterListCallbacks.forEach((callback) => {
              callback(list);
            });

            return list;
          });
        },
      });
    });
  },
};
