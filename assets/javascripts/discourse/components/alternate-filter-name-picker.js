import Component from "@glimmer/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { debounce } from "discourse-common/utils/decorators";

export default class AlternateFilterNamePicker extends Component {
  @debounce(500)
  setAlternateNameForFilter(event) {
    return ajax(
      `/admin/plugins/filter_tags/${event.target.dataset.tagName}/set_alternate_name_for_tag.json`,
      {
        data: { alternate_name: event.target.value },
        type: "POST",
      }
    ).catch(popupAjaxError);
  }

  @action
  setAlternateComposerOnlyForFilter(event) {
    return ajax(
      `/admin/plugins/filter_tags/${event.target.dataset.tagName}/set_alternate_composer_only_for_tag.json`,
      {
        data: { alternate_composer_only: !!event.target.checked },
        type: "POST",
      }
    ).catch(popupAjaxError);
  }
}
