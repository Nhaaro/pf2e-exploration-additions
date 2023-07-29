import { CharacterPF2e } from "@actor/index.js";
import { ActionItemPF2e } from "@item/action/document.js";
import { ItemSummaryData } from "@item/data/index.js";
import { AbstractEffectPF2e } from "@item/index.js";
import { ActorPF2e, ScenePF2e, TokenDocumentPF2e } from "@module/documents.js";
import { RollOptionToggle } from "@module/rules/synthetics.js";
import { MODULE_NAME } from "src/constants.ts";
import { ExplorationEffects, UUIDS } from "./uuids.ts";
import { htmlQuery } from "src/system/util/dom.ts";

interface ActionsDetails {
  label: string;
  actions: ActionItemPF2e<CharacterPF2e<TokenDocumentPF2e<ScenePF2e>>>[];
}

interface ExplorationActivitiesSheetData {
  activities: ActionsDetails;
  skillActivities: ActionsDetails;
}

interface ExplorationSheetOptions extends DocumentSheetOptions {}

interface ExplorationSheetData<TActor extends ActorPF2e>
  extends DocumentSheetData<TActor> {
  actions: ExplorationActivitiesSheetData;
  action: ActionsDetails["actions"][number];
  actionChatData: ItemSummaryData;
  actor: ActorPF2e;
  effects: RawObject<ActiveEffect<TActor>>[];
  toggles: RollOptionToggle[];
  user: { isGM: boolean };
}
type PrePrepSheetData<TActor extends ActorPF2e> = Partial<
  ExplorationSheetData<TActor>
>;

const TEMPLATES = {
  [MODULE_NAME]: {
    request: `modules/${MODULE_NAME}/templates/exploration-activities/exploration-activities.hbs`,
  },
  pf2e: {
    action: {
      content: "systems/pf2e/templates/chat/action/content.hbs",
      flavor: "systems/pf2e/templates/chat/action/flavor.hbs",
    },
  },
};

export class ExplorationSheet<TActor extends ActorPF2e> extends DocumentSheet<
  TActor,
  ExplorationSheetOptions
> {
  constructor(actor: TActor) {
    super(actor, {
      id: `pf2e-exploration-additions--exploration-activity-${actor.id}`,
    });
  }

  static override get defaultOptions(): DocumentSheetOptions {
    const options = super.defaultOptions;

    return {
      ...options,
      classes: [
        ...options.classes,
        "pf2e-exploration-additions",
        "exploration-activity",
        "dorako-ui",
        "actor",
        "character",
      ],
      width: 850,
      height: 700,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "ExplorationActivities",
        },
      ],
      scrollY: [".tab.activities", ".tab.skillActivities"],

      id: "pf2e-exploration-additions--exploration-activity",
    };
  }
  override get template(): string {
    return TEMPLATES[MODULE_NAME].request;
  }
  override get title(): string {
    return game.i18n.format(
      "pf2e-exploration-additions.Applications.ExplorationActivities.Title",
      { name: this.actor.name }
    );
  }
  get actor(): TActor {
    return this.document;
  }

  #actions: ExplorationActivitiesSheetData = Object.keys(UUIDS).reduce(
    (activities, category) => ({
      ...activities,
      [category]: { label: "", actions: [] },
    }),
    {} as ExplorationActivitiesSheetData
  );
  #action: ActionsDetails["actions"][number] | undefined;
  #actionChatData: ItemSummaryData | undefined;

  async getData(
    options: ExplorationSheetOptions = this.options
  ): Promise<ExplorationSheetData<TActor>> {
    options.id ||= this.id;
    options.editable = this.isEditable;

    // The Actor and its Items
    const actorData = this.actor.toObject(false) as ActorPF2e;

    const sheetData: PrePrepSheetData<TActor> = {
      cssClass: this.actor.isOwner ? "editable" : "locked",
      editable: this.isEditable,
      limited: this.actor.limited,
      document: this.actor,
      options,
      owner: this.actor.isOwner,
      title: this.title,
      actor: actorData,
      data: actorData.system,
      effects: [],
      // items: actorData.items,
      user: { isGM: game.user.isGM },
      // traits: createSheetTags(traitsMap, {
      //   value: Array.from(this.actor.traits),
      // }),
      toggles: this.actor.synthetics.toggles,
      // inventory: this.prepareInventory(),
      // enrichedContent: {},
      actions: this.#actions,
      action: this.#action,
      actionChatData: this.#actionChatData,
    };

    await this.prepareItems?.(sheetData as ExplorationSheetData<TActor>);

    return sheetData as ExplorationSheetData<TActor>;
  }

  /**
   * Prepares items in the actor for easier access during sheet rendering.
   * @param sheetData Data from the actor associated to this sheet.
   */
  async prepareItems(sheetData: ExplorationSheetData<TActor>): Promise<void> {
    await this.#prepareActions(sheetData);
  }

  /**
   * Prepares the actions list to be accessible from the sheet.
   * @param sheetData Data of the actor to be shown in the sheet.
   */
  async #prepareActions(
    sheetData: ExplorationSheetData<TActor>
  ): Promise<void> {
    const actions = await Promise.all(
      Object.values(UUIDS).flatMap((actions) =>
        Object.values(actions).map((uuid) =>
          fromUuid<ActionsDetails["actions"][number]>(uuid)
        )
      )
    );
    const effects = await Promise.all(
      Object.values(ExplorationEffects).map((uuid) =>
        fromUuid<
          AbstractEffectPF2e<CharacterPF2e<TokenDocumentPF2e<ScenePF2e>>>
        >(uuid)
      )
    );

    sheetData.actions = this.#actions = Object.keys(
      UUIDS
    ).reduce<ExplorationActivitiesSheetData>(
      (acc, category) => ({
        ...acc,
        [category as keyof typeof UUIDS]: {
          label: "",
          actions: Object.values(UUIDS[category as keyof typeof UUIDS])
            .map((uuid) => {
              const action = actions.find((action) => action?.uuid === uuid);
              const effect = effects.find(
                (effect) => effect?.name === action?.name
              );
              return action?.clone({
                name: game.i18n.localize(
                  `pf2e-exploration-additions.Applications.ExplorationActivities.${category}.actions.${action.slug}.name`
                ),
                img: effect ? effect.img : action?.img,
                system: {
                  description: {
                    value: game.i18n.localize(
                      `pf2e-exploration-additions.Applications.ExplorationActivities.${category}.actions.${action.slug}.description`
                    ),
                  },
                },
              });
            })
            .sort((action1, action2) =>
              action1!.name.localeCompare(action2!.name)
            ),
        },
      }),
      {} as ExplorationActivitiesSheetData
    );
  }

  override activateListeners($html: JQuery): void {
    super.activateListeners($html);
    const html = $html.get(0)! as HTMLFormElement;

    const mainPanel = htmlQuery(
      html,
      `.tab[data-tab=${this.options.tabs[0].initial}]`
    );
    if (!mainPanel)
      throw Error("Unexpected failure while rendering Exploration sheet");

    // Don't subscribe to edit buttons it the sheet is NOT editable
    if (!this.options.editable) return;

    $html.find<HTMLLIElement>(".item.action")?.on("click", async (event) => {
      const slug = event.currentTarget.dataset.action;
      if (!slug || slug === this.#action?.slug) return;

      const tab = event.currentTarget.closest<HTMLElement>("[data-tab]");
      const category = tab?.dataset.tab as keyof ExplorationActivitiesSheetData;
      if (!tab || !category) return;

      await this.activateAction(slug, category);
    });
  }

  /**
   * Activate a new action by id
   */
  async activateAction(
    slug: string,
    category: keyof ExplorationActivitiesSheetData
  ) {
    if (!this.#actions[category].actions.length)
      throw new Error(
        `${this.constructor.name} does not define any ${category}`
      );
    const actions = this.#actions[category];
    if (!actions)
      throw new Error(
        `Actions category "${category}" not found in ${this.constructor.name}`
      );

    // Store the active action
    const action = this.#actions?.[category].actions.find(
      (a) => a.slug === slug
    );

    this.#action = action?.clone({
      system: {
        description: {
          value: await TextEditor.enrichHTML(action.system.description.value, {
            async: true,
            rollData: {
              item: action,
              actor: this.actor,
            },
          }),
        },
        traits: {
          rarityLabel:
            CONFIG.PF2E.rarityTraits[
              (action.system.traits.rarity ||
                "") as keyof typeof CONFIG.PF2E.rarityTraits
            ],
        },
      },
    });
    this.#actionChatData = await this.#action?.getChatData();

    await this.render(true);
  }

  protected override async _updateObject(
    event: SubmitEvent,
    formData: Record<string, unknown>
  ): Promise<void> {
    console.log("_updateObject::", event, formData);

    if (event.submitter?.dataset.action === "close") this.#action = undefined;
    await this.generateChat();
    if (event.submitter?.dataset.action === "apply") await this.applyEffect();

    return super._updateObject(event, formData);
  }

  async generateChat() {
    const content = await renderTemplate(TEMPLATES.pf2e.action.content, {
      imgPath: this.#action?.img ?? "systems/pf2e/icons/actions/Empty.webp",
      message:
        this.#action?.name ??
        game.i18n.localize(
          "pf2e-exploration-additions.Applications.ExplorationActivities.ChatMessage.NoAction"
        ),
    });
    const flavor = await renderTemplate(TEMPLATES.pf2e.action.flavor, {
      action: {
        title: game.i18n.format(
          "pf2e-exploration-additions.Applications.ExplorationActivities.Title",
          { name: this.actor.name }
        ),
      },
    });

    // TODO: figure out the type
    const ChatMessage = CONFIG.ChatMessage.documentClass as unknown as any;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });

    // @ts-ignore function exists, but TS could not infer it
    await ChatMessage.create({
      type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
      speaker,
      flavor,
      content,
    });
  }

  //used to apply effect
  async applyEffect() {
    const effectName = this.#action!.name;

    const effect =
      ExplorationEffects[effectName as keyof typeof ExplorationEffects];
    if (effect != undefined) {
      const item = (await fromUuid(effect))?.toObject() || {};
      await this.actor.createEmbeddedDocuments("Item", [item]);
    }
  }
}

(window as any).ExplorationActivityApp = ExplorationSheet;
