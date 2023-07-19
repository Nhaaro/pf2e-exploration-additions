import { CharacterPF2e } from "@actor/character/document.js";

declare module "@actor/character/document.js" {
  declare class CharacterPF2e<
    TParent extends TokenDocumentPF2e | null = TokenDocumentPF2e | null
  > extends CreaturePF2e<TParent> {
    ownership: Record<string, DocumentOwnershipLevel>;
  }
}
