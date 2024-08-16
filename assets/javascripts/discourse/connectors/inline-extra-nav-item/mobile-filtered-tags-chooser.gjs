import Component from "@glimmer/component";
import { hash } from "@ember/helper";
import { service } from "@ember/service";
import FilteredTagsChooser from "../../components/global-filter/filtered-tags-chooser";

export default class MobileFilteredTagsChooser extends Component {
  @service site;

  <template>
    {{#if this.site.mobileView}}
      <FilteredTagsChooser
        @currentCategory={{@category}}
        @options={{hash categoryId=@category.id}}
      />
    {{/if}}
  </template>
}
