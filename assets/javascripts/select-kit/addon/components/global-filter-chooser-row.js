import SelectKitRowComponent from "select-kit/components/select-kit/select-kit-row";
import { computed } from "@ember/object";

export default SelectKitRowComponent.extend({
  classNames: ["global-filter-chooser-row"],

  @computed("rowLabel", "item.label", "title", "rowName")
  get label() {
    const label =
      this.rowLabel ||
      this.getProperty(this.item, "label") ||
      this.title ||
      this.rowName;

    if (
      this.selectKit.options.allowAny &&
      this.rowValue === this.selectKit.filter &&
      this.getName(this.selectKit.noneItem) !== this.rowName &&
      this.getName(this.selectKit.newItem) === this.rowName
    ) {
      return I18n.t("select_kit.create", { content: label });
    }

    return this._tagName(label);
  },

  _tagName(filter) {
    const currentFilter = this.site.global_filters.findBy("name", filter);

    return (
      currentFilter.alternate_name ||
      currentFilter.name?.replace(/-|_/g, " ") ||
      ""
    );
  },
});
