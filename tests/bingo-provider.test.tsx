import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import BingoProvider, { useBingo } from "@/components/providers/BingoProvider";

function Probe() {
  const ctx = useBingo();
  return <div data-ready={ctx.ready} data-calls={ctx.calls.length} />;
}

describe("BingoProvider", () => {
  it("provides default context without crashing", () => {
    const { getByRole } = render(<BingoProvider><Probe /></BingoProvider>);
    const el = getByRole("generic");
    expect(el).toBeTruthy();
  });
});
