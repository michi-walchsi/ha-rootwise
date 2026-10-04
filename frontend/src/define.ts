// Home Assistant's app bundle replaces window.customElements with a scoped
// registry polyfill when it starts. This module is loaded in parallel with that
// bundle, so on a slow phone it can run first: elements defined then end up in
// the replaced registry, which Home Assistant no longer reads ("Custom element
// doesn't exist"). The polyfill also defines each element on the native
// registry, so once <home-assistant> is defined the swap is done.

export type ElementDefinitions = ReadonlyArray<readonly [string, CustomElementConstructor]>;

export async function defineWhenReady(elements: ElementDefinitions): Promise<void> {
  if (document.querySelector("home-assistant")) {
    await customElements.whenDefined("home-assistant");
  }
  // Look the registry up only now: it may have been swapped meanwhile.
  for (const [tag, element] of elements) {
    if (!customElements.get(tag)) customElements.define(tag, element);
  }
}
