import { element } from 'angular'

export default function(instance, td, row, col, prop, value, cellProperties) {
  const { $geocodeStatus, $geocodeError } = instance.getSourceDataAtRow(row)

  switch ($geocodeStatus) {
    case 'pending':
      td.innerHTML = '<div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div>&nbsp;<div class="sk-child sk-bounce2"></div>&nbsp;<div class="sk-child sk-bounce3"></div></div>'
      cellProperties.readOnly = true
      break;
    
    case 'error':
      element(td).parent().addClass('bg-danger')
      td.innerHTML = '<i class="fa fa-exclamation-triangle"></i> ' + $geocodeError
      cellProperties.readOnly = true
      break;
    
    default:
      element(td).parent().removeClass('bg-danger')
      cellProperties.readOnly = false
      Handsontable.renderers.NumericRenderer.apply(this, arguments);
  }

  element(td).css({ textAlign: 'center' })
}
