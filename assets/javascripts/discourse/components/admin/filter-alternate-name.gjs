import { Input } from "@ember/component";
import { on } from "@ember/modifier";
import i18n from "discourse-common/helpers/i18n";

const FilterAlternateName = <template>
  <div>
    <h4>{{i18n "global_filter.admin.alternate_child_tag_name"}}</h4>
    <Input
      @value={{@filterTag.alternate_name}}
      data-tag-name={{@filterTag.name}}
      {{on "input" @setAlternateNameForFilter}}
      placeholder={{i18n "global_filter.admin.alternate_name_placeholder"}}
    />

    <div class="composer-only-wrapper">
      <Input
        @type="checkbox"
        name="composerOnly"
        class="composer-only-input"
        @checked={{@filterTag.alternate_composer_only}}
        data-tag-name={{@filterTag.name}}
        {{on "change" @setAlternateComposerOnlyForFilter}}
      />
      <label class="global-filter-label">
        {{i18n "global_filter.admin.composer_only"}}
      </label>
    </div>
  </div>
</template>;

export default FilterAlternateName;
