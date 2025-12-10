// services/trim.service.js

export function trimObject(data) {
  if (!data || typeof data !== "object") return data;

  const trimmed = {};

  for (const key in data) {
    const value = data[key];

    if (typeof value === "string") {
      trimmed[key] = value.trim();
    } else if (Array.isArray(value)) {
      trimmed[key] = value.map((item) => trimObject(item));
    } else if (value && typeof value === "object") {
      trimmed[key] = trimObject(value);
    } else {
      trimmed[key] = value;
    }
  }

  return trimmed;
}
