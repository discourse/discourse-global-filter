import Controller from "@ember/controller";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class extends Controller {
  @action
  setCategoryIdsForTag(filterTag, categories) {
    let categoryIds = [];
    let categoriesAndParents = new Set(categories);

    categories.map((c) => {
      categoryIds.push(c.id);

      // if category has parent, include parent
      if (c.parent_category_id) {
        categoryIds.push(c.parent_category_id);
        categoriesAndParents.add(c.parentCategory);

        // check if category is subsubcategory
        if (c.parentCategory.parent_category_id) {
          categoryIds.push(c.parentCategory.parent_category_id);
          categoriesAndParents.add(c.parentCategory.parentCategory);
        }
      }
    });

    const data = {
      category_ids: categoryIds,
    };

    return ajax(
      `/admin/plugins/filter_tags/${filterTag.name}/set_category_ids_for_tag.json`,
      {
        data,
        type: "POST",
      }
    )
      .then(() => {
        const uniqCategories = Array.from(categoriesAndParents);
        filterTag.set("categories", uniqCategories);
      })
      .catch(popupAjaxError);
  }
}
