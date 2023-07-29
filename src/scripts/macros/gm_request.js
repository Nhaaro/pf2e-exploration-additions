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
    const actorId = token.actor.id;

    game.socket.emit("module.pf2e-exploration-additions", {
      action: "explorationActivity",
      actorId,
    });
  });
}
