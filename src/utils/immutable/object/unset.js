export default function unset(obj, prop) {
  const copy = {...obj}
  delete copy[prop]
  return copy
}
