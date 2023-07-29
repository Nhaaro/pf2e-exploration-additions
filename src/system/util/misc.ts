type Optional<T> = T | null | undefined;

/**
 * Check if a key is present in a given object in a type safe way
 *
 * @param obj The object to check
 * @param key The key to check
 */
function objectHasKey<O extends object>(obj: O, key: unknown): key is keyof O {
  return (typeof key === "string" || typeof key === "number") && key in obj;
}

/** Generate and return an HTML element for a FontAwesome icon */
type FontAwesomeStyle = "solid" | "regular" | "duotone";

function fontAwesomeIcon(
  glyph: string,
  {
    style = "solid",
    fixedWidth = false,
  }: { style?: FontAwesomeStyle; fixedWidth?: boolean } = {}
): HTMLElement {
  const styleClass = `fa-${style}`;
  const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`;
  const icon = document.createElement("i");
  icon.classList.add(styleClass, glyphClass);
  if (fixedWidth) icon.classList.add("fa-fw");

  return icon;
}

export { type Optional, fontAwesomeIcon, objectHasKey };
