import collectionsJson from "./json/collections.json";

export const collections = collectionsJson.map((item, index) => ({ ...item, accent: ["rose", "sand", "plum", "ivory"][index] }));
