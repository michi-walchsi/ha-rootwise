import { describe, expect, it } from "vitest";
import { plantPath } from "../src/navigate";
import { pageFor } from "../src/panel/rootwise-panel";

describe("pageFor", () => {
  it("shows the overview at the panel root and for unknown paths", () => {
    expect(pageFor("")).toEqual({ kind: "overview" });
    expect(pageFor(undefined)).toEqual({ kind: "overview" });
    expect(pageFor("/somewhere")).toEqual({ kind: "overview" });
  });

  it("opens a plant by its id, also from the link the cards build", () => {
    expect(pageFor("/plant/01J9ABC")).toEqual({ kind: "plant", id: "01J9ABC" });
    const path = plantPath("a b/c").slice("/rootwise".length);
    expect(pageFor(path)).toEqual({ kind: "plant", id: "a b/c" });
  });
});
