import Component from "@glimmer/component";
import { hash } from "@ember/helper";
import { service } from "@ember/service";
import PopupInputTip from "discourse/components/popup-input-tip";
import MiniTagChooser from "select-kit/components/mini-tag-chooser";

export default class FilteredTagsComposerChooser extends Component {
  @service siteSettings;
  @service site;

  get hiddenValues() {
    const children = this.site.global_filters.flatMap((gf) =>
      gf.filter_children ? Object.keys(gf.filter_children) : []
    );
    const globalFilters = this.siteSettings.global_filters.split("|");
    return [...globalFilters, ...children];
  }

  <template>
    <div class="tags-input filtered-tags-composer-chooser">
      {{#if @canEditTags}}
        <MiniTagChooser
          @value={{@value}}
          @onChange={{@onChange}}
          @options={{hash @options hiddenValues=this.hiddenValues}}
        />
        <PopupInputTip @validation={{@tagValidation}} />
      {{/if}}
    </div>
  </template>
}
