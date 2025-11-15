import { auth } from "@/lib/auth";
import { subscribe } from "@/lib/events";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("", { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const unsub = subscribe(userId, send);
      send({ ok: true, type: "init" });
      (controller as any)._unsub = unsub;
    },
    cancel() {
      const unsub = (this as any)._unsub;
      if (typeof unsub === "function") unsub();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
