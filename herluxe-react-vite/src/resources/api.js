import { sampleUsers } from "./sampleData";

export const USERS_API_URL = import.meta.env.VITE_MINDX_USERS_API_URL || "https://mindx-mockup-server.vercel.app/api/resources/users?apiKey=6ab3d52e3a04ea4a097e4dba";

export function extractResourceItems(payload) {
  const candidates = [payload?.data?.data, payload?.data, payload?.items, payload];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const numericObjects = candidate.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const numericValues = Object.keys(entry).filter((key) => /^\d+$/.test(key)).map((key) => entry[key]);
      return numericValues.length ? numericValues : [entry];
    });
    if (numericObjects.length) return numericObjects;
  }
  return [];
}

export async function fetchUsersResource() {
  const response = await fetch(USERS_API_URL);
  if (!response.ok) throw new Error(`Users resource returned ${response.status}`);
  const items = extractResourceItems(await response.json());
  return items.length ? items : sampleUsers;
}

export async function replaceUsersResource(users) {
  const response = await fetch(USERS_API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(users),
  });
  if (!response.ok) throw new Error(`Users resource update returned ${response.status}`);
  return response;
}
