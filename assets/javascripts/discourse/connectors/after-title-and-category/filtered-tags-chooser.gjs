import { fn, hash } from "@ember/helper";
import FilteredTagsComposerChooser from "../../components/global-filter/filtered-tags-composer-chooser";

const FilteredTagsChooser = <template>
  <FilteredTagsComposerChooser
    @tagValidation={{@outletArgs.tagValidation}}
    @canEditTags={{@outletArgs.canEditTags}}
    @value={{@outletArgs.model.tags}}
    @onChange={{fn (mut @outletArgs.model.tags)}}
    @options={{hash
      disabled=@outletArgs.disabled
      categoryId=@outletArgs.model.categoryId
      minimum=@outletArgs.model.minimumRequiredTags
    }}
  />
</template>;

export default FilteredTagsChooser;
