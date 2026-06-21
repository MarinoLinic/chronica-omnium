export const UNCATEGORIZED = 'Uncategorized'

// Normalize a possibly-null category value into a stable, displayable label.
function normalizeCategory(value) {
	return value === null || value === undefined || value === '' ? UNCATEGORIZED : value
}

// Include every event that has a start date. Categories are normalized so that
// events without a type/field are still selectable rather than silently dropped.
export function filterData(data) {
	return data
		.filter((obj) => obj.start !== null && obj.start !== undefined)
		.map((obj) => ({
			...obj,
			type: normalizeCategory(obj.type),
			field: normalizeCategory(obj.field),
		}))
		.sort((a, b) => a.start - b.start)
}

export function filterDataTypes(data, types) {
	return data.filter((obj) => types.includes(obj.type))
}

export function filterDataFields(data, fields) {
	return data.filter((obj) => fields.includes(obj.field))
}
