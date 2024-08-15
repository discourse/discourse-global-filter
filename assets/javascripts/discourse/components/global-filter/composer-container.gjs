import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import GlobalFilterChooser from "../../../select-kit/addon/components/global-filter-chooser";

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

  <template>
    {{#if this.canDisplay}}
      <div class="global-filter-composer-container">
        <GlobalFilterChooser
          @value={{@composer.tags}}
          @onChange={{action (mut @composer.tags)}}
        />
      </div>
    {{/if}}
  </template>
}
