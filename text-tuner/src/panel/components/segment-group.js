export function buildSegmentBarHTML({ className = "", role, ariaLabel, buttonsHtml }) {
  const roleAttr = role ? ` role="${role}"` : "";
  const ariaAttr = ariaLabel ? ` aria-label="${ariaLabel}"` : "";
  return `
      <div class="tt-segment-bar tt-field-block${className ? ` ${className}` : ""}"${roleAttr}${ariaAttr}>
        <div class="tt-segment">${buttonsHtml}</div>
      </div>`;
}

export function buildSegmentRowHTML({ id, label, options, defaultValue }) {
  const initial = defaultValue ?? options[0]?.value ?? "";
  const buttons = options
    .map((opt) => {
      const pressed = opt.value === initial;
      const inner = opt.icon
        ? opt.icon
        : `<span class="tt-segment__text">${opt.label}</span>`;
      return `<button
          type="button"
          class="tt-segment__btn${opt.icon ? " tt-segment__btn--icon" : ""}"
          data-value="${opt.value}"
          aria-label="${opt.label}"
          aria-pressed="${pressed ? "true" : "false"}"
        >${inner}</button>`;
    })
    .join("");

  return `
      <div class="tt-segment-row tt-field-block" id="${id}" role="group" aria-label="${label}">
        <span class="tt-segment-row__label">${label}</span>
        <div class="tt-segment">${buttons}</div>
        <input type="hidden" data-role="segment-value" value="${initial}" />
      </div>`;
}

export function getSegmentGroupValue(container) {
  if (!container) return "";
  const pressed = container.querySelector('.tt-segment__btn[aria-pressed="true"]');
  if (pressed?.dataset.value) return pressed.dataset.value;
  return container.querySelector('[data-role="segment-value"]')?.value ?? "";
}

export function setSegmentGroupValue(container, value) {
  if (!container) return;
  let matched = false;
  container.querySelectorAll(".tt-segment__btn").forEach((btn) => {
    const on = btn.dataset.value === value;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) matched = true;
  });
  if (!matched && container.querySelector(".tt-segment__btn")) {
    const first = container.querySelector(".tt-segment__btn");
    first.setAttribute("aria-pressed", "true");
    value = first.dataset.value;
  }
  const hidden = container.querySelector('[data-role="segment-value"]');
  if (hidden) hidden.value = value;
}

export function bindSegmentGroup(container, onChange) {
  if (!container || container.dataset.pgSegmentBound) return;
  container.dataset.pgSegmentBound = "1";
  container.querySelectorAll(".tt-segment__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSegmentGroupValue(container, btn.dataset.value);
      onChange?.();
    });
  });
}
