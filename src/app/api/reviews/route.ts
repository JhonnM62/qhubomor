import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content, rating } = reviewSchema.parse(body);

    const userId = (session as any).userId;

    // Rate limiting: Check if user posted in the last minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentReview = await prisma.review.findFirst({
      where: {
        userId,
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    });

    if (recentReview) {
      return new NextResponse("Por favor espera un momento antes de publicar otra opinión.", { status: 429 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        title,
        content,
        rating,
        status: "activo",
      },
    });

    console.info(JSON.stringify({
      event: "REVIEW_CREATED",
      userId,
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit");

    const reviews = await prisma.review.findMany({
      where: {
        status: "activo",
        ...(userId ? { userId } : {}),
      },
      include: {
        User: {
          select: { name: true, image: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
