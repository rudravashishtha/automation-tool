export function tryParseHeaders(
  raw?: string | Record<string, unknown> | null
): Record<string, string> {
  if (!raw) return {};

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!k) throw new Error("Empty header key");
      result[k] = v == null ? "" : String(v);
    }
    return result;
  }

  if (typeof raw !== "string")
    throw new Error("Headers must be a string or object");

  const trimmed = raw.trim();
  if (!trimmed) return {};

  // Try JSON first
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([k, v]) => {
          if (!k) throw new Error("Empty header key");
          return [k, v == null ? "" : String(v)];
        })
      );
    }
  } catch {
    // not JSON: continue to flexible parsing
  }

  // Flexible parsing (lines / comma-separated pairs)
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const result: Record<string, string> = {};

  const parsePair = (pair: string) => {
    const colonIndex = pair.indexOf(":");
    const eqIndex = pair.indexOf("=");

    if (colonIndex > -1) {
      const key = pair.slice(0, colonIndex).trim();
      const val = pair.slice(colonIndex + 1).trim();
      if (!key) throw new Error("Invalid header pair");
      result[key] = val;
      return;
    }

    if (eqIndex > -1) {
      const key = pair.slice(0, eqIndex).trim();
      const val = pair.slice(eqIndex + 1).trim();
      if (!key) throw new Error("Invalid header pair");
      result[key] = val;
      return;
    }

    const parts = pair.split(/\s+/);
    if (parts.length >= 2) {
      const key = parts.shift()!;
      const val = parts.join(" ");
      result[key] = val;
      return;
    }

    throw new Error("Could not parse header pair");
  };

  if (lines.length === 1) {
    const single = lines[0];
    const commaParts = single.includes(",")
      ? single
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [single];
    commaParts.forEach(parsePair);
  } else {
    lines.forEach(parsePair);
  }

  return result;
}
