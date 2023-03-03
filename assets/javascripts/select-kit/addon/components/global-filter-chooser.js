import MultiSelectComponent from "select-kit/components/multi-select";
import FormTemplate from "admin/models/form-template";
import { computed } from "@ember/object";

export default MultiSelectComponent.extend({
  pluginApiIdentifiers: ["global-filter-chooser"],
  classNames: ["global-filter-chooser"],
  valueProperty: "name",
  selectKitOptions: {
    none: "global_filter.composer_dropdown.none",
  },

  modifyComponentForRow() {
    return "global-filter-chooser-row";
  },

  get content() {
    return this.site.global_filters;
  },

  _tagName(filter) {
    return filter.alternate_name || filter.name?.replace(/-|_/g, " ") || "";
  },
});
