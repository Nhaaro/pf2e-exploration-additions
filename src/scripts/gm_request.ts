import { CharacterPF2e } from "@actor/character/document.js";
import { MODULENAME } from "../constants.ts";

// Macro for GM to request exploration activities from selected players
const tokens = canvas.tokens.controlled.filter((t) =>
  ["character"].includes(t.actor?.type || "")
);

if (tokens.length === 0) {
  ui.notifications.error(`You must select at least one pc token`);
} else {
  const chatData = {
    content: "GM has requested Exploration Activities",
  };
  ChatMessage.create(chatData, {});

  tokens.forEach((token) => {
    const actor = token.actor as CharacterPF2e;
    const tokenID = token.id;

    game.socket.emit(`module.${MODULENAME}`, {
      action: "explorationActivity",
      actor,
      tokenID,
    });
  });
}
