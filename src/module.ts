import "../tools/vite/hmr.ts";

import { CharacterPF2e } from "@actor/index.js";
import { TokenPF2e } from "@module/canvas/index.js";
import { MODULE_NAME } from "src/constants.ts";

import "./styles/module.css";

export interface ExplorationActivityRequest {
  action: "explorationActivity";
  actor: CharacterPF2e;
  tokenID: TokenPF2e["id"];
}

export type SocketPayload = ExplorationActivityRequest;

Hooks.once("init", async function () {});

Hooks.once("ready", async function () {
  console.log(`${MODULE_NAME} | Ready`);

  game.socket.on(`module.${MODULE_NAME}`, (payload) => {
    console.log("socketData", payload);

    switch (payload.action) {
      case "explorationActivity":
        console.groupCollapsed(
          `${MODULE_NAME}::${payload.action}`,
          payload.actor.name
        );
        console.log(payload);
        console.groupEnd();
        break;

      default:
        console.log("socket.on", payload);
        break;
    }
  });
});
