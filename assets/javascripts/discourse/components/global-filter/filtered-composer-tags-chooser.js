import Component from "@glimmer/component";
import { inject as service } from "@ember/service";

export default class GlobalFilterFilteredComposerTagsChooser extends Component {
  @service siteSettings;
  @service site;

  get hiddenValues() {
    const children = this.site.global_filters.flatMap((gf) =>
      gf.filter_children ? Object.keys(gf.filter_children) : []
    );

    const globalFilters = this.siteSettings.global_filters.split("|");

    return [...globalFilters, ...children];
  }
}
