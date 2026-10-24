import records from './generated/catalog.json'
export default records
export const eventById = id => records.find(r => r.id === id || String(r.id_num) === String(id))
