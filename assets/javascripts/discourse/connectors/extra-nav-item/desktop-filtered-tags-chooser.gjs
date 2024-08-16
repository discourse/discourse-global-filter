import Component from "@glimmer/component";
import { hash } from "@ember/helper";
import { service } from "@ember/service";
import FilteredTagsChooser from "../../components/global-filter/filtered-tags-chooser";

export default class DesktopFilteredTagsChooser extends Component {
  @service site;

  <template>
    {{#if this.site.desktopView}}
      <FilteredTagsChooser
        @currentCategory={{@category}}
        @options={{hash categoryId=@category.id}}
      />
    {{/if}}
  </template>
}
