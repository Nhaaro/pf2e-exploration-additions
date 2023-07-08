import { CharacterPF2e } from "@actor/index.js";
import { TokenPF2e } from "@module/canvas/index.js";
import { MODULENAME } from "src/constants.ts";

export interface ExplorationActivityRequest {
  action: "explorationActivity";
  actor: CharacterPF2e;
  tokenID: TokenPF2e["id"];
}

export type SocketPayload = ExplorationActivityRequest;

Hooks.once("init", async function () {});

Hooks.once("ready", async function () {
  console.log(`${MODULENAME} | Ready`);

  game.socket.on(`module.${MODULENAME}`, (payload) => {
    console.log("socketData", payload);

    switch (payload.action) {
      case "explorationActivity":
        console.groupCollapsed(
          `${MODULENAME}::${payload.action}`,
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
