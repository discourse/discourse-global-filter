import Component from "@glimmer/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { debounce } from "discourse-common/utils/decorators";
import { tracked } from "@glimmer/tracking";

export default class AlternateFilterNamePicker extends Component {
  @tracked creatingChildFor;
  @tracked filterChildName = null;
  @tracked alternateChildTagName = null;
  @tracked iconClass = null;

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

  @action
  setFilterChildrenForFilter(filter) {
    return ajax(
      `/admin/plugins/filter_tags/${filter}/set_filter_children_for_tag.json`,
      {
        data: {
          child_tag: this.filterChildName?.[0],
          alternate_child_tag_name: this.alternateChildTagName,
          icon_class: this.iconClass,
        },
        type: "POST",
      }
    )
      .catch(popupAjaxError)
      .then(() => {
        this.creatingChildFor = null;
        this.filterChildName = null;
        this.alternateChildTagName = null;
        this.iconClass = null;
      });
  }

  @action
  cancelSetFilterChildrenForFilter() {
    this.creatingChildFor = null;
    this.filterChildName = null;
    this.alternateChildTagName = null;
    this.iconClass = null;
  }

  @action
  setCreateChild(filterTag) {
    this.creatingChildFor = filterTag;
  }

  @action
  setFilterChildName(value) {
    this.filterChildName = value;
  }
}
