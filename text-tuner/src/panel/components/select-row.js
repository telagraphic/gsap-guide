export function buildDropdownFieldHTML({ id, label, optionsHtml, inputAttrs = "" }) {
  return `
      <div class="tt-dropdown-field tt-field-block">
        <label class="tt-dropdown-field__label" for="${id}">${label}</label>
        <select class="tt-select" id="${id}" ${inputAttrs}>${optionsHtml}</select>
      </div>`;
}

/** Inline label + select in one control row (matches track slider / segment row rhythm). */
export function buildSelectRowHTML({ id, label, optionsHtml, inputAttrs = "" }) {
  return `
      <div class="tt-select-row tt-field-block">
        <label class="tt-select-row__label" for="${id}">${label}</label>
        <select class="tt-select tt-select--row" id="${id}" ${inputAttrs}>${optionsHtml}</select>
      </div>`;
}
