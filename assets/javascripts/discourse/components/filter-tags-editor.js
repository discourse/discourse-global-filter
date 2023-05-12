import Component from "@glimmer/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { debounce } from "discourse-common/utils/decorators";
import { tracked } from "@glimmer/tracking";

export default class FilterTagsEditor extends Component {
  @tracked toggleChildMenuFor;
  @tracked editingChildFor;
  @tracked filterChildName;
  @tracked alternateChildTagName;
  @tracked iconClass;
  @tracked filterTags = this.args.filterTags;

  @action
  setCreateChild(filterTag) {
    this.toggleChildMenuFor = filterTag;
  }

  @action
  setFilterChildName(value) {
    this.filterChildName = value;
  }

  @action
  editFilterChildForFilter(filter, childValues) {
    this.toggleChildMenuFor = filter;
    this.editingChildFor = filter;
    this.filterChildName = childValues.name;
    this.alternateChildTagName = childValues.alternate_name;
    this.iconClass = childValues.icon;
  }

  @action
  cancelSetFilterChildrenForFilter() {
    this.toggleChildMenuFor = null;
    this.editingChildFor = null;
    this.filterChildName = null;
    this.alternateChildTagName = null;
    this.iconClass = null;
  }

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
          // instead of having seperate create / edit functions we can just
          // toggle this one line to either get the existing child name or
          // get the child name from the tag drop
          child_tag: this.editingChildFor
            ? this.filterChildName
            : this.filterChildName?.[0],
          alternate_child_tag_name: this.alternateChildTagName,
          icon: this.icon,
        },
        type: "POST",
      }
    )
      .catch(popupAjaxError)
      .then((model) => {
        this.filterTags = model.filter_tags;
        this.toggleChildMenuFor = null;
        this.filterChildName = null;
        this.alternateChildTagName = null;
        this.iconClass = null;
      });
  }

  @action
  deleteFilterChildForFilter(filter, name) {
    return ajax(
      `/admin/plugins/filter_tags/${filter}/delete_filter_child_for_tag.json`,
      {
        data: { child_tag: name },
        type: "DELETE",
      }
    )
      .catch(popupAjaxError)
      .then((model) => {
        this.filterTags = model.filter_tags;
        this.toggleChildMenuFor = null;
        this.filterChildName = null;
        this.alternateChildTagName = null;
        this.iconClass = null;
      });
  }
}
