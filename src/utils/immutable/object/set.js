export default function set(obj, prop, val) {
  switch (typeof prop) {
    case 'string':
      return {...obj, [prop]: val}

    case 'object':
      return {...obj, ...prop}
    
    default:
      throw new Error('prop must be a string or object')
  }
}
