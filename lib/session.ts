let currentSessionId: string | null = null;

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  return currentSessionId;
}

export function resetSession(): void {
  currentSessionId = null;
}

export async function logInteraction(
  type: "verifier" | "source",
  data: any
): Promise<boolean> {
  try {
    const response = await fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        sessionId: getSessionId(),
        ...data,
      }),
    });

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error("Failed to log interaction:", error);
    return false;
  }
}
