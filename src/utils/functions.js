export function filterData(data) {
	return data.filter((obj) => obj.start >= 2020) // !== null
}

export function filterDataTypes(data, types) {
	console.log(types)
	return data.filter((obj) => types.includes(obj.type))
}
