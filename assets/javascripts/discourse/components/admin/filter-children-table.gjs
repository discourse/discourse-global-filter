import { fn } from "@ember/helper";
import DButton from "discourse/components/d-button";
import i18n from "discourse-common/helpers/i18n";

const FilterChildrenTable = <template>
  <div class="alternate-filter-name-picker-wrapper">
    <h4 class="no-header-margin">
      {{i18n "global_filter.admin.filter_children"}}
    </h4>
  </div>
  <table class="global-filter-table-wrapper">
    <thead>
      <tr>
        <th>{{i18n "global_filter.admin.filter_child_name"}}</th>
        <th>
          {{i18n "global_filter.admin.alternate_child_tag_name"}}
        </th>
        <th>{{i18n "global_filter.admin.icon"}}</th>
      </tr>
    </thead>
    <tbody>
      {{#each-in @filterTag.filter_children as |name values|}}
        <tr>
          <td>{{name}}</td>
          <td>
            {{#if values.alternate_name}}
              {{values.alternate_name}}
            {{else}}
              <i>{{i18n
                  "global_filter.admin.filter_child_no_alternate_name"
                }}</i>
            {{/if}}
          </td>
          <td>
            {{#if values.icon}}
              {{values.icon}}
            {{else}}
              <i>{{i18n "global_filter.admin.filter_child_no_icon"}}</i>
            {{/if}}
          </td>
          <td>
            <DButton
              @ariaLabel="global_filter.admin.edit_filter_child"
              @action={{fn @editFilterChildForFilter @filterTag.name values}}
              @icon="pencil"
            />
            <DButton
              @ariaLabel="global_filter.admin.delete_filter_child"
              @action={{fn
                @deleteFilterChildForFilter
                @filterTag.name
                values.name
              }}
              @icon="far-trash-can"
            />
          </td>
        </tr>
      {{else}}
        <td><i>{{i18n "global_filter.admin.no_filter_children"}}</i></td>
      {{/each-in}}
    </tbody>
  </table>
</template>;

export default FilterChildrenTable;
