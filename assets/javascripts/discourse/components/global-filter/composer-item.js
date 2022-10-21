import Component from "@glimmer/component";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { withPluginApi } from "discourse/lib/plugin-api";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class GlobalFilterComposerItem extends Component {
  spacedTag = this.args.filter.replace(/-|_/g, " ");
  checked;

  constructor() {
    super(...arguments);

    this.checked = this.args.composer.tags?.includes(
      this.args.filter || this.args.tagParam
    )
      ? true
      : false;
  }

  @action
  toggleTag() {
    if (this.args.composer.tags.includes(this.args.filter)) {
      const filterIndex = this.args.composer.tags.indexOf(this.args.filter);
      this.args.composer.tags.splice(filterIndex, 1);
    } else {
      this.args.composer.tags.push(this.args.filter);
    }

    let categories = [];
    withPluginApi("1.3.0", (api) => {
      ajax(`/global_filter/filter_tags/categories_for_filter_tags.json`, {
        data: { tags: this.args.composer.tags },
      })
        .then((model) => {
          categories = model.categories;
        })
        .catch(popupAjaxError);

      api.modifySelectKit("category-chooser").replaceContent((component) => {
        if (!component.selectKit.filter) {
          return categories;
        }
      });
    });
  }
}
