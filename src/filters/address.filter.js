export function addressFilter({ address, city, state, zip }) {
  if (address && city && state && zip) {
    return address + ', ' + city + ', ' + state + ' ' + zip
  } else {
    return ''
  }
}

export default () => addressFilter
