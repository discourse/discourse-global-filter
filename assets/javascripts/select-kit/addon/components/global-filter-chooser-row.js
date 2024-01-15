import { computed } from "@ember/object";
import { escapeExpression } from "discourse/lib/utilities";
import I18n from "I18n";
import SelectKitRowComponent from "select-kit/components/select-kit/select-kit-row";

export default SelectKitRowComponent.extend({
  classNames: ["global-filter-chooser-row"],

  get icons() {
    return [escapeExpression(this.item.icon) || `gf-${this.rowName}`];
  },

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

    return (
      this.item.alternate_name || this.item.name?.replace(/-|_/g, " ") || ""
    );
  },
});
