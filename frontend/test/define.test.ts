import { afterEach, describe, expect, it } from "vitest";
import { defineWhenReady } from "../src/define";

// What Home Assistant's app bundle does on start: a scoped registry polyfill
// replaces window.customElements with a fresh registry that only knows its own
// definitions and puts a stand-in class on the native registry.
class PolyfillRegistry {
  private readonly elements = new Map<string, CustomElementConstructor>();
  private readonly waiting = new Map<string, Array<(element: CustomElementConstructor) => void>>();

  constructor(private readonly native: CustomElementRegistry) {}

  define(tag: string, element: CustomElementConstructor): void {
    if (this.elements.has(tag)) {
      throw new DOMException(`the name "${tag}" has already been used with this registry`);
    }
    this.elements.set(tag, element);
    if (!this.native.get(tag)) this.native.define(tag, class extends HTMLElement {});
    for (const resolve of this.waiting.get(tag) ?? []) resolve(element);
  }

  get(tag: string): CustomElementConstructor | undefined {
    return this.elements.get(tag);
  }

  whenDefined(tag: string): Promise<CustomElementConstructor> {
    const element = this.elements.get(tag);
    if (element) return Promise.resolve(element);
    return new Promise((resolve) => this.waiting.set(tag, [...(this.waiting.get(tag) ?? []), resolve]));
  }
}

const native = customElements;

function swapRegistry(): PolyfillRegistry {
  const registry = new PolyfillRegistry(native);
  Object.defineProperty(globalThis, "customElements", { value: registry, configurable: true, writable: true });
  return registry;
}

afterEach(() => {
  Object.defineProperty(globalThis, "customElements", { value: native, configurable: true, writable: true });
  document.body.replaceChildren();
});

class First extends HTMLElement {}
class Second extends HTMLElement {}
class Third extends HTMLElement {}
class Fourth extends HTMLElement {}

describe("defineWhenReady", () => {
  it("defines at once outside Home Assistant", async () => {
    await defineWhenReady([["rootwise-test-first", First]]);
    expect(customElements.get("rootwise-test-first")).toBe(First);
  });

  it("waits until Home Assistant has swapped the registry", async () => {
    document.body.append(document.createElement("home-assistant"));
    const done = defineWhenReady([["rootwise-test-second", Second]]);
    await Promise.resolve();
    expect(native.get("rootwise-test-second")).toBeUndefined();

    const registry = swapRegistry();
    registry.define("home-assistant", class extends HTMLElement {});
    await done;

    expect(registry.get("rootwise-test-second")).toBe(Second);
    expect(native.get("rootwise-test-second")).not.toBe(Second);
  });

  it("defines at once when Home Assistant has already started", async () => {
    document.body.append(document.createElement("home-assistant"));
    const registry = swapRegistry();
    registry.define("home-assistant", class extends HTMLElement {});

    await defineWhenReady([["rootwise-test-third", Third]]);

    expect(registry.get("rootwise-test-third")).toBe(Third);
  });

  it("leaves a tag alone that is already defined", async () => {
    customElements.define("rootwise-test-fourth", Fourth);
    await defineWhenReady([["rootwise-test-fourth", class extends HTMLElement {}]]);
    expect(customElements.get("rootwise-test-fourth")).toBe(Fourth);
  });
});
