export function filterData(data) {
	return data.filter((obj) => obj.start !== null && obj.id_num < 442 && obj.type !== null && obj.field !== null) // !== null // >= 2020
}

export function filterDataTypes(data, types) {
	return data.filter((obj) => types.includes(obj.type))
}

export function filterDataFields(data, fields) {
	return data.filter((obj) => fields.includes(obj.field))
}
