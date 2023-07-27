// Adapted from pf2e/src/module/system/text-editor.ts based on packs

import { ActorPF2e } from "@actor/base.js";
import {
  AbilityString,
  SkillAbbreviation,
  SkillLongForm,
} from "@actor/types.js";
import { ItemPF2e } from "@item/base.js";
import { fontAwesomeIcon, objectHasKey } from "src/util/misc.ts";

export async function enrichString(
  data: RegExpMatchArray,
  options: EnrichHTMLOptionsPF2e = {}
): Promise<HTMLElement | null> {
  if (data.length < 4) return null;
  const item = options.rollData?.item ?? null;
  const [_match, , paramString, buttonLabel] = data;

  const actor = options.rollData?.actor ?? item?.actor ?? null;
  return createAction({
    paramString,
    inlineLabel: buttonLabel,
    item,
    actor,
  });
}

function createAction({
  paramString,
  inlineLabel,
  item = null,
  actor = item?.actor ?? null,
}: {
  paramString: string;
  inlineLabel?: string;
  item?: ItemPF2e | null;
  actor?: ActorPF2e | null;
}): HTMLSpanElement | null {
  // Parse the parameter string
  const parts = paramString.split("|");
  const params: { type: string; dc: string } & Record<string, string> = {
    type: "",
    dc: "",
  };
  for (const paramPart of parts) {
    const param = paramPart.trim();
    const paramParts = param.split(":");
    if (paramParts.length !== 2) {
      ui.notifications.warn(
        `Error. Expected "parameter:value" but got: ${param}`
      );
      return null;
    }
    params[paramParts[0].trim()] = paramParts[1].trim();
  }
  if (!params.type) {
    ui.notifications.warn(
      game.i18n.localize("PF2E.InlineCheck.Errors.TypeMissing")
    );
    return null;
  }

  // Build the inline link
  const html = document.createElement("span");
  const name = params.name ?? item?.name ?? params.type;
  html.setAttribute(
    "data-pf2-label",
    game.i18n.format("PF2E.InlineCheck.DCWithName", { name })
  );
  const role = params.showDC ?? "owner";
  html.setAttribute("data-pf2-show-dc", params.showDC ?? role);

  // Skill or Lore
  const shortForm = (() => {
    if (objectHasKey(SKILL_EXPANDED, params.type)) {
      return SKILL_EXPANDED[params.type].shortform;
    } else if (objectHasKey(SKILL_DICTIONARY, params.type)) {
      return params.type;
    }
    return;
  })();
  const skillLabel = shortForm
    ? game.i18n.localize(CONFIG.PF2E.skills[shortForm])
    : params.type
        .split("-")
        .map((word) => {
          return word.slice(0, 1).toUpperCase() + word.slice(1);
        })
        .join(" ");
  html.innerHTML = inlineLabel ?? skillLabel;
  html.dataset.pf2Action = game.pf2e.system.sluggify(item?.slug ?? "", {
    camel: "dromedary",
  });

  if (params.type && params.dc) {
    // Let the inline roll function handle level base DCs
    const checkDC =
      params.dc === "@self.level"
        ? params.dc
        : getCheckDC({ name, params, item, actor });
    html.setAttribute("data-pf2-dc", checkDC);
    const text = html.innerHTML;
    if (checkDC !== "@self.level") {
      html.innerHTML = game.i18n.format("PF2E.DCWithValueAndVisibility", {
        role,
        dc: checkDC,
        text,
      });
    }
  }

  // Set "passive action" icon
  const icon = fontAwesomeIcon("diamond", { style: "regular" });
  html.innerHTML = `${icon.outerHTML}${html.innerHTML}`;

  return html;
}

interface EnrichHTMLOptionsPF2e extends EnrichHTMLOptions {
  rollData?: {
    actor?: ActorPF2e | null;
    item?: ItemPF2e | null;
    mod?: number;
    [key: string]: unknown;
  };
}

function getCheckDC({
  params,
  item = null,
  actor = item?.actor ?? null,
}: {
  name: string;
  params: { type: string; dc: string } & Record<string, string | undefined>;
  item?: ItemPF2e | null;
  actor?: ActorPF2e | null;
}): string {
  const dc = params.dc;
  const base = (() => {
    if (dc.startsWith("resolve") && actor) {
      params.immutable ||= "true";
      const resolve = dc.match(/resolve\((.+?)\)$/);
      const value = resolve && resolve?.length > 0 ? resolve[1] : "";
      const saferEval = (resolveString: string): number => {
        try {
          return Roll.safeEval(
            Roll.replaceFormulaData(resolveString, { actor, item: item ?? {} })
          );
        } catch {
          return 0;
        }
      };
      return Number(saferEval(value));
    }
    return Number(dc) || undefined;
  })();

  if (base) {
    return base.toString();
  }
  return "0";
}

/* ----------------------------------------- */
/* pf2e/src/module/actor/values.ts           */
/* ----------------------------------------- */
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

/* ----------------------------------------- */
/* pf2e/src/module/rules/helpers.ts          */
/* ----------------------------------------- */
