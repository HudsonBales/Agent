import { NextResponse } from "next/server";
import { sessions } from "@/data/mock";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const { sessionId, message } = await request.json();
  const session = sessions.find((item) => item.id === sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  session.messages.push({
    id: nanoid(),
    role: "user",
    content: message,
    createdAt: now
  });

  session.messages.push({
    id: nanoid(),
    role: "assistant",
    content: "Thanks! Imagine streaming tokens + tools here.",
    createdAt: now
  });

  session.updatedAt = now;

  return NextResponse.json({ session });
}
