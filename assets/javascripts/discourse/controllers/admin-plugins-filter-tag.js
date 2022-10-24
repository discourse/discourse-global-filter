import Controller from "@ember/controller";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class extends Controller {
  @action
  setCategoryIdsForTag(filterTag, categories) {
    let category_ids = [];

    categories.map((c) => {
      category_ids.push(c.id);

      // if category has parent, include parent
      if (c.parent_category_id) {
        category_ids.push(c.parent_category_id);

        // check if category is subsubcategory
        if (c.parentCategory.parent_category_id) {
          category_ids.push(c.parentCategory.parent_category_id);
        }
      }
    });

    const data = {
      category_ids,
    };

    return ajax(
      `/admin/plugins/filter_tags/${filterTag.name}/set_category_ids_for_tag.json`,
      {
        data,
        type: "POST",
      }
    )
      .then(() => {
        filterTag.set("categories", categories);
      })
      .catch(popupAjaxError);
  }
}
