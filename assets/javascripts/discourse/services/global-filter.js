import { tracked } from "@glimmer/tracking";
import Service from "@ember/service";

export default class GlobalFilterCurrentService extends Service {
  @tracked
  categoryDropContent = {
    categories: [],
    subcategories: [],
  };
}
