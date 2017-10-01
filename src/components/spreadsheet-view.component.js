const spreadsheetViewComponent = {
  bindings: {
    rows: '<',
    onChange: '&'
  },
  controller: function() {
    this.afterChange = (changes, source) => {
      if (!Array.isArray(changes)) return
      changes.forEach(([row, prop, , newVal]) =>
        this.onChange({ $event: source, $index: row, $change: { [prop]: newVal }})
      )
    }
  },
  template: `
    <hot-table stretch-h="'all'" row-headers="true" datarows="$ctrl.rows" min-rows="25" min-spare-rows="3"
        on-after-change="$ctrl.afterChange">
      <hot-column data="name" title="'Household Name'" width="'150px'"></hot-column>
      <hot-column data="address" title="'Address'" width="'150px'"></hot-column>
      <hot-column data="city" title="'City'" width="'100px'"></hot-column>
      <hot-column data="state" title="'State'" width="'50px'"></hot-column>
      <hot-column data="zip" title="'Zip'" width="'75px'"></hot-column>
      <hot-column data="lat" title="'Latitude'" type="'numeric'" format="'0.0000000'" width="'70px'"></hot-column>
      <hot-column data="lng" title="'Longitude'" type="'numeric'" format="'0.0000000'" width="'70px'"></hot-column>
    </hot-table>`
}

export default spreadsheetViewComponent