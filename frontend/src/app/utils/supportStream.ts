import api from "./api";
import { getAuthToken } from "./auth";

export type SupportEvent = { type: string; ticketId: number };

export function subscribeSupportStream(path: string, onEvent: (event: SupportEvent) => void): () => void {
  let active = true;
  const controller = new AbortController();

  const connect = async () => {
    while (active) {
      try {
        const token = getAuthToken();
        if (!token) return;
        const response = await fetch(`${api.defaults.baseURL}${path}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error("Support stream unavailable");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (active) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
          let boundary = buffer.indexOf("\n\n");
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const eventName = block.split("\n").find((line) => line.startsWith("event:"))?.slice(6).trim();
            const data = block.split("\n").filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim()).join("\n");
            if (eventName === "support" && data) onEvent(JSON.parse(data) as SupportEvent);
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch {
        if (!active || controller.signal.aborted) return;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  void connect();
  return () => { active = false; controller.abort(); };
}
