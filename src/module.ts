import "../tools/vite/hmr.ts";

import { CharacterPF2e } from "@actor/character/document.js";
import { MODULE_NAME } from "src/constants.ts";
import { ExplorationSheet } from "./applications/dialogs/exploration-activity-app.ts";
import { enrichString } from "./system/text-editor.ts";

import "./styles/module.css";

export interface ExplorationActivityRequest {
  action: "explorationActivity";
  actorId: string;
}

export type SocketPayload = ExplorationActivityRequest;

Hooks.once("init", async function () {
  // Register custom enricher
  CONFIG.TextEditor.enrichers.push({
    pattern: new RegExp("@(Action)\\[([^\\]]+)\\](?:{([^}]+)})?", "g"),
    enricher: (match, options) => enrichString(match, options),
  });
});

Hooks.once("ready", async function () {
  console.log(`${MODULE_NAME} | Ready`);

  game.socket.on(`module.${MODULE_NAME}`, (payload) => {
    console.log("socketData", payload);
    const actor = game.actors.get(payload.actorId) as CharacterPF2e;

    switch (payload.action) {
      case "explorationActivity":
        console.groupCollapsed(`${MODULE_NAME}::${payload.action}`, actor.name);
        console.log(payload);
        console.groupEnd();

        if (actor.ownership[game.user.id] >= 3) {
          new ExplorationSheet(actor).render(true);
        }
        break;

      default:
        console.log("socket.on", payload);
        break;
    }
  });
});
