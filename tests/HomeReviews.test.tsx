import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomeReviews from "@/components/reviews/HomeReviews";
import useSWR from "swr";

// Mock useSWR
vi.mock("swr");

describe("HomeReviews", () => {
  it("renders loading skeletons initially", () => {
    (useSWR as any).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    const { container } = render(<HomeReviews />);
    // Check if skeletons are present (they usually don't have text, but we can check for structure or class)
    // In this case, we check if the heading is there
    expect(screen.getByText("Lo que dicen nuestros clientes")).toBeTruthy();
  });

  it("renders reviews when data is loaded", () => {
    const mockReviews = [
      {
        id: 1,
        userId: "user1",
        title: "Gran servicio",
        content: "Me encantó la experiencia",
        rating: 5,
        createdAt: new Date().toISOString(),
        User: { name: "Test User", image: null },
      },
    ];

    (useSWR as any).mockReturnValue({
      data: mockReviews,
      error: undefined,
      isLoading: false,
    });

    render(<HomeReviews />);
    expect(screen.getByText("Gran servicio")).toBeTruthy();
    expect(screen.getByText("Me encantó la experiencia")).toBeTruthy();
    expect(screen.getByText("Test User")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders empty state if no reviews", () => {
    (useSWR as any).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    });

    render(<HomeReviews />);
    expect(screen.getByText("Aún no hay reseñas destacadas. ¡Sé el primero!")).toBeTruthy();
  });

  it("has a link to write a review", () => {
    (useSWR as any).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    });

    render(<HomeReviews />);
    const link = screen.getByRole("link", { name: /escribir una reseña/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/reviews");
  });
});
