export const hasAllKeys = (...keys) => obj => {
  for (let key of keys) {
    if (!obj || !obj[key]) return false
  }
  return true
}

export const hasSomeKeys = (...keys) => obj => {
  for (let key of keys) {
    if (obj && obj[key]) return true
  }
  return false
}

export const addressFields = ['address', 'city', 'state', 'zip']
export const coordinatesFields = ['lat', 'lng']

export const hasAddress = hasAllKeys(...addressFields)
export const hasSomeAddress = hasSomeKeys(...addressFields)

export const hasCoordinates = hasAllKeys(...coordinatesFields)
