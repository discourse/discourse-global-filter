import TagDrop from "select-kit/components/tag-drop";

const FilteredTagsChooser = <template>
  <li class="filtered-tag-drop">
    <TagDrop
      @currentCategory={{@category}}
      @noSubcategories={{@currentCategory.subcategory_ids}}
      @tagId={{null}}
    />
  </li>
</template>;

export default FilteredTagsChooser;
