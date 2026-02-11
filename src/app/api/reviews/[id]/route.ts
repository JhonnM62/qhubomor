import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
        return new NextResponse("Invalid ID", { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (existingReview.userId !== (session as any).userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { title, content, rating } = reviewSchema.parse(body);

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { title, content, rating },
    });

    console.info(JSON.stringify({
      event: "REVIEW_UPDATED",
      userId: (session as any).userId,
      reviewId: review.id,
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown"
    }));

    return NextResponse.json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return new NextResponse("Invalid data", { status: 400 });
    }
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
        return new NextResponse("Invalid ID", { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (existingReview.userId !== (session as any).userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    console.info(JSON.stringify({
      event: "REVIEW_DELETED",
      userId: (session as any).userId,
      reviewId,
      timestamp: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown"
    }));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
