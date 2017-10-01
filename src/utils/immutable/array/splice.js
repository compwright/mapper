export default function splice(arr, start, deleteCount, ...items) {
  return [...arr.slice(0, start), ...items, ...arr.slice(start + deleteCount)]
}
