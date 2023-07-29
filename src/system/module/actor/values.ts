import { SkillAbbreviation } from "@actor/creature/data.js";
import { AbilityString, SkillLongForm } from "@actor/types.js";

const SKILL_DICTIONARY = {
  acr: "acrobatics",
  arc: "arcana",
  ath: "athletics",
  cra: "crafting",
  dec: "deception",
  dip: "diplomacy",
  itm: "intimidation",
  med: "medicine",
  nat: "nature",
  occ: "occultism",
  prf: "performance",
  rel: "religion",
  soc: "society",
  ste: "stealth",
  sur: "survival",
  thi: "thievery",
} as const;

interface SkillExpanded {
  ability: AbilityString;
  shortform: SkillAbbreviation;
}

const SKILL_EXPANDED: Record<SkillLongForm, SkillExpanded> = {
  acrobatics: { ability: "dex", shortform: "acr" },
  arcana: { ability: "int", shortform: "arc" },
  athletics: { ability: "str", shortform: "ath" },
  crafting: { ability: "int", shortform: "cra" },
  deception: { ability: "cha", shortform: "dec" },
  diplomacy: { ability: "cha", shortform: "dip" },
  intimidation: { ability: "cha", shortform: "itm" },
  medicine: { ability: "wis", shortform: "med" },
  nature: { ability: "wis", shortform: "nat" },
  occultism: { ability: "int", shortform: "occ" },
  performance: { ability: "cha", shortform: "prf" },
  religion: { ability: "wis", shortform: "rel" },
  society: { ability: "int", shortform: "soc" },
  stealth: { ability: "dex", shortform: "ste" },
  survival: { ability: "wis", shortform: "sur" },
  thievery: { ability: "dex", shortform: "thi" },
};

export { SKILL_DICTIONARY, SKILL_EXPANDED };
