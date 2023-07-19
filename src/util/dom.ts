/**  DOM helper functions that return HTMLElement(s) (or `null`) */

type Optional<T> = T | null | undefined;
type MaybeHTML = Optional<Document | Element | EventTarget>;

export function htmlQuery<K extends keyof HTMLElementTagNameMap>(
  parent: MaybeHTML,
  selectors: K
): HTMLElementTagNameMap[K] | null;
export function htmlQuery(
  parent: MaybeHTML,
  selectors: string
): HTMLElement | null;
export function htmlQuery<E extends HTMLElement = HTMLElement>(
  parent: MaybeHTML,
  selectors: string
): E | null;
export function htmlQuery(
  parent: MaybeHTML,
  selectors: string
): HTMLElement | null {
  if (!(parent instanceof Element || parent instanceof Document)) return null;
  return parent.querySelector<HTMLElement>(selectors);
}
