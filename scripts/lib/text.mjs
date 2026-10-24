// Recover only the reversible Windows-1252-as-Latin-1 control characters.
// A literal '?' has already lost information and requires a sourced edit.
const cp1252 = {
  128: "€",
  130: "‚",
  131: "ƒ",
  132: "„",
  133: "…",
  134: "†",
  135: "‡",
  136: "ˆ",
  137: "‰",
  138: "Š",
  139: "‹",
  140: "Œ",
  142: "Ž",
  145: "‘",
  146: "’",
  147: "“",
  148: "”",
  149: "•",
  150: "–",
  151: "—",
  152: "˜",
  153: "™",
  154: "š",
  155: "›",
  156: "œ",
  158: "ž",
  159: "Ÿ",
};
export function repairText(text) {
  return text
    .replace(/[\u0080-\u009f]/g, (c) => cp1252[c.charCodeAt(0)] || c)
    .normalize("NFC");
}
export function repairTree(value, key = "") {
  if (key === "legacy") return value;
  if (typeof value === "string") return repairText(value);
  if (Array.isArray(value)) return value.map((v) => repairTree(v));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, repairTree(v, k)]),
    );
  return value;
}
