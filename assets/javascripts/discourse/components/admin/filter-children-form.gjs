import { Input } from "@ember/component";
import { fn, hash } from "@ember/helper";
import { eq } from "truth-helpers";
import DButton from "discourse/components/d-button";
import i18n from "discourse-common/helpers/i18n";
import TagChooser from "select-kit/components/tag-chooser";

const FilterChildrenForm = <template>
  {{#if (eq @toggleChildMenuFor @filterTag.name)}}
    {{#unless @editingChildFor}}
      <div class="child-picker-spacer">
        <label class="global-filter-label">
          {{i18n "global_filter.admin.filter_child_name"}}
        </label>
        <TagChooser
          @tags={{@filterChildName}}
          @onChange={{action @setFilterChildName}}
          @options={{hash limit=1}}
        />
      </div>
    {{/unless}}

    <div class="child-picker-spacer">
      <label class="global-filter-label">
        {{i18n "global_filter.admin.alternate_child_tag_name"}}
      </label>
      <Input
        @value={{@alternateChildTagName}}
        placeholder={{i18n
          "global_filter.admin.alternate_child_tag_name_placeholder"
        }}
      />
    </div>

    <div class="child-picker-spacer">
      <label class="global-filter-label">
        {{i18n "global_filter.admin.icon"}}
      </label>
      <Input
        @value={{@icon}}
        placeholder={{i18n "global_filter.admin.icon_placeholder"}}
      />
      <DButton
        @ariaLabel="global_filter.admin.create_filter_child"
        @action={{fn @setFilterChildrenForFilter @filterTag.name}}
        @icon="check"
      />
      <DButton
        @ariaLabel="global_filter.admin.cancel_create_filter_child"
        @action={{@cancelSetFilterChildrenForFilter}}
        @icon="xmark"
      />
    </div>
  {{else}}
    <DButton
      @label="global_filter.admin.new_filter_child"
      class="btn-default"
      @action={{fn @setCreateChild @filterTag.name}}
    />
  {{/if}}
</template>;

export default FilterChildrenForm;
