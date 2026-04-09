import { render, screen } from "@testing-library/react";
import { App } from "../src/App";

test("App renders Dashboard with Drafter Drafter heading", () => {
  render(<App />);
  const heading = screen.getByText(/Drafter Drafter/i);
  expect(heading).toBeInTheDocument();
});
