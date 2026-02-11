import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewForm } from "../src/components/reviews/ReviewForm";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ReviewForm", () => {
  it("renders correctly", () => {
    render(<ReviewForm />);
    expect(screen.getByText("Deja tu opinión")).toBeTruthy();
    expect(screen.getByLabelText("Título")).toBeTruthy();
    expect(screen.getByLabelText("Opinión")).toBeTruthy();
  });

  it("shows validation errors when submitted empty", async () => {
    render(<ReviewForm />);
    const submitBtn = screen.getByText("Publicar Opinión");
    fireEvent.click(submitBtn);
    
    await waitFor(() => {
      expect(screen.getByText("El título es requerido")).toBeTruthy();
    });
  });
});
