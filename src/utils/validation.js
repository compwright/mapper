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
