import source from "./generated/catalog.json";
import { resolveDates } from "./utils/dates";
const records = source.map((r) => resolveDates(r));
export default records;
export const eventById = (id) =>
  records.find((r) => r.id === id || String(r.id_num) === String(id));
