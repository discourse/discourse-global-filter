import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { debounce } from "discourse-common/utils/decorators";
import FilterAlternateName from "./admin/filter-alternate-name";
import FilterChildrenForm from "./admin/filter-children-form";
import FilterChildrenTable from "./admin/filter-children-table";

export default class FilterTagsEditor extends Component {
  @tracked toggleChildMenuFor;
  @tracked editingChildFor;
  @tracked filterChildName;
  @tracked alternateChildTagName;
  @tracked icon;
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
    this.icon = childValues.icon;
  }

  @action
  cancelSetFilterChildrenForFilter() {
    this.toggleChildMenuFor = null;
    this.editingChildFor = null;
    this.filterChildName = null;
    this.alternateChildTagName = null;
    this.icon = null;
  }

  @debounce(500)
  async setAlternateNameForFilter(event) {
    try {
      const response = await ajax(
        `/admin/plugins/filter_tags/${event.target.dataset.tagName}/set_alternate_name_for_tag.json`,
        {
          data: { alternate_name: event.target.value },
          type: "POST",
        }
      );
      return response;
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async setAlternateComposerOnlyForFilter(event) {
    try {
      const response = await ajax(
        `/admin/plugins/filter_tags/${event.target.dataset.tagName}/set_alternate_composer_only_for_tag.json`,
        {
          data: { alternate_composer_only: !!event.target.checked },
          type: "POST",
        }
      );
      return response;
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async setFilterChildrenForFilter(filter) {
    try {
      const response = await ajax(
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
      );
      this.filterTags = response.filter_tags;
      this.toggleChildMenuFor = null;
      this.filterChildName = null;
      this.alternateChildTagName = null;
      this.icon = null;
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async deleteFilterChildForFilter(filter, name) {
    try {
      const response = await ajax(
        `/admin/plugins/filter_tags/${filter}/delete_filter_child_for_tag.json`,
        {
          data: { child_tag: name },
          type: "DELETE",
        }
      );
      this.filterTags = response.filter_tags;
      this.toggleChildMenuFor = null;
      this.filterChildName = null;
      this.alternateChildTagName = null;
      this.icon = null;
    } catch (error) {
      popupAjaxError(error);
    }
  }

  <template>
    <div>
      {{#each this.filterTags as |filterTag|}}
        <div class="global-filter-wrapper">
          <h2>{{filterTag.name}}</h2>
          <div class="alternate-filter-name-picker-wrapper">
            <FilterAlternateName
              @filterTag={{filterTag}}
              @setAlternateNameForFilter={{this.setAlternateNameForFilter}}
              @setAlternateComposerOnlyForFilter={{this.setAlternateComposerOnlyForFilter}}
            />
            <div>
              <FilterChildrenTable
                @filterTag={{filterTag}}
                @editFilterChildForFilter={{this.editFilterChildForFilter}}
                @deleteFilterChildForFilter={{this.deleteFilterChildForFilter}}
              />
              <FilterChildrenForm
                @filterTag={{filterTag}}
                @filterChildName={{this.filterChildName}}
                @setFilterChildName={{this.setFilterChildName}}
                @toggleChildMenuFor={{this.toggleChildMenuFor}}
                @editingChildFor={{this.editingChildFor}}
                @alternateChildTagName={{this.alternateChildTagName}}
                @icon={{this.icon}}
                @setFilterChildrenForFilter={{this.setFilterChildrenForFilter}}
                @cancelSetFilterChildrenForFilter={{this.cancelSetFilterChildrenForFilter}}
                @setCreateChild={{this.setCreateChild}}
              />
            </div>
          </div>
        </div>
        <br />
      {{/each}}
    </div>
  </template>
}
