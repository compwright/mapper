import { element } from 'angular'

export default function(instance, td, row, col, prop, value, cellProperties) {
  if (value !== null) {
    td.innerHTML = value + 1
  }
  element(td).css({ textAlign: 'center' })
}
