import { listSessions } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function Home() {
  const sessions = await listSessions();
  if (sessions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">
        <p>No sessions yet.</p>
      </div>
    );
  }
  redirect(`/chat/${sessions[0].id}`);
}
