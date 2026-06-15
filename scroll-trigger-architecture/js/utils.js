// UTILITY FUNCTIONS



/**
 * Removes the prehide class from the given elements.
 * @param  {...any} elements - The elements to remove the prehide class from.
 */
export function removePrehideClasses(...elements) {
  elements.forEach((el) => el.classList.remove("anim-prehide"));
}
