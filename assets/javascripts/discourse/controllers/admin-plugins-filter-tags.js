import Controller from "@ember/controller";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class extends Controller {
  @action
  async setCategoryIdsForTag(filterTag, cids) {
    try {
      await ajax(
        `/admin/plugins/filter_tags/${filterTag.name}/set_category_ids_for_tag.json`,
        {
          data: { category_ids: cids },
          type: "POST",
        }
      );
      filterTag.set("category_ids", cids.join("|"));
    } catch (error) {
      popupAjaxError(error);
    }
  }
}
