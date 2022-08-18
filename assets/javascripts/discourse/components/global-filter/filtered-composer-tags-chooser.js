import Component from "@glimmer/component";
import { inject as service } from "@ember/service";

export default class GlobalFilterFilteredComposerTagsChooser extends Component {
  @service siteSettings;

  hiddenValues = this.siteSettings.global_filters.split("|");
}
