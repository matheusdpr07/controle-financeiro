import { render, screen } from "@testing-library/react";
import { Line, LineChart } from "recharts";
import { expect, test } from "vitest";

test("renderiza Recharts 3 com React 19 e camada de acessibilidade", () => {
  render(
    <LineChart
      width={400}
      height={200}
      data={[{ value: 1 }, { value: 2 }]}
      accessibilityLayer
    >
      <Line dataKey="value" isAnimationActive={false} />
    </LineChart>,
  );
  expect(screen.getByRole("application")).toBeInTheDocument();
});
