import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import BufferedProxy from "ember-buffered-proxy/proxy";
import { sort, gt } from "@ember/object/computed";
import { inject as service } from "@ember/service";

export default Component.extend({
  tagName: "",
  site: service(),
  categoriesSorting: ["position"],
  categoriesOrdered: sort("categoriesBuffered", "categoriesSorting"),

  allCategories: gt("filterTag.categories.length", 0),

  @discourseComputed("site.categories.[]")
  categoriesBuffered(categories) {
    const exclUncategorized = categories.filter(
      (c) =>
        c.id !== this.site.uncategorized_category_id &&
        c.parent_category_id !== this.site.uncategorized_category_id
    );

    return (exclUncategorized || []).map((c) =>
      BufferedProxy.create({ content: c })
    );
  },

  didInsertElement() {
    this._super(...arguments);

    // order categories by parent (similar to the "reorder categories" modal in core)
    const reorderChildren = (categoryId, depth, index) => {
      this.categoriesBuffered.forEach((category) => {
        if (
          (categoryId === null && !category.get("parent_category_id")) ||
          category.get("parent_category_id") === categoryId
        ) {
          category.setProperties({ depth, position: index++ });
          index = reorderChildren(category.get("id"), depth + 1, index);
        }
      });

      return index;
    };

    reorderChildren(null, 0, 0);

    this.categoriesBuffered.forEach((bc) => {
      if (bc.get("hasBufferedChanges")) {
        bc.applyBufferedChanges();
      }
    });

    this.notifyPropertyChange("categoriesBuffered");
  },
});
