import Component from "@glimmer/component";
import { inject as service } from "@ember/service";

export default class GlobalFilterComposerContainer extends Component {
  @service router;

  get canDisplay() {
    return (
      (this.args.composer.creatingTopic === true &&
        !this.args.composer.creatingPrivateMessage) ||
      (this.args.composer.editingFirstPost === true &&
        !this.args.composer.privateMessage)
    );
  }
}
