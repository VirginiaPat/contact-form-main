// ============================================================
// TYPES
// ============================================================

/**
 * @typedef {Object} FormElements
 * @property {HTMLFormElement} form
 * @property {Object} inputs
 * @property {HTMLInputElement} inputs.firstName
 * @property {HTMLInputElement} inputs.lastName
 * @property {HTMLInputElement} inputs.email
 * @property {NodeListOf<HTMLInputElement>} inputs.queryType
 * @property {HTMLTextAreaElement} inputs.message
 * @property {HTMLInputElement} inputs.consent
 * @property {Object} errors
 * @property {HTMLElement} errors.firstName
 * @property {HTMLElement} errors.lastName
 * @property {HTMLElement} errors.email
 * @property {HTMLElement} errors.queryType
 * @property {HTMLElement} errors.message
 * @property {HTMLElement} errors.consent
 * @property {HTMLButtonElement} submitButton
 * @property {HTMLElement} successPopup
 */

// ============================================================
// SELECTORS
// ============================================================

/** @type {FormElements} */
const elements = {
  form: document.querySelector("form"),

  inputs: {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    email: document.getElementById("email"),
    queryType: document.querySelectorAll('input[name="queryType"]'),
    message: document.getElementById("message"),
    consent: document.getElementById("consent"),
  },

  errors: {
    firstName: document.getElementById("firstName-error"),
    lastName: document.getElementById("lastName-error"),
    email: document.getElementById("email-error"),
    queryType: document.getElementById("queryType-error"),
    message: document.getElementById("message-error"),
    consent: document.getElementById("consent-error"),
  },

  submitButton: document.getElementById("submit-button"),
  successPopup: document.getElementById("success-popup"),
};

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validates a required text input field.
 * @param {HTMLInputElement} input - The input element to validate.
 * @returns {boolean} True if the field is not empty, false otherwise.
 */
function validateRequired(input) {
  return input.value.trim().length > 0;
}

/**
 * Validates the email input field.
 * @param {HTMLInputElement} input - The email input element to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.value.trim());
}

/**
 * Validates that at least one query type radio button is selected.
 * @param {NodeListOf<HTMLInputElement>} inputs - The radio button elements.
 * @returns {boolean} True if one is selected, false otherwise.
 */
function validateQueryType(inputs) {
  return [...inputs].some((input) => input.checked);
}

/**
 * Validates the consent checkbox.
 * @param {HTMLInputElement} input - The checkbox element to validate.
 * @returns {boolean} True if the checkbox is checked, false otherwise.
 */
function validateConsent(input) {
  return input.checked;
}

// ============================================================
// UI FUNCTIONS
// ============================================================

/**
 * Shows an error message for a given input field.
 * @param {HTMLElement} input - The input element to mark as invalid.
 * @param {HTMLElement} errorElement - The error span to display.
 * @returns {void}
 */
function showError(input, errorElement) {
  input.classList.add("outline-red-errors");
  input.classList.remove("outline-grey-500");
  errorElement.classList.remove("hidden");
}

/**
 * Hides the error message for a given input field.
 * @param {HTMLElement} input - The input element to mark as valid.
 * @param {HTMLElement} errorElement - The error span to hide.
 * @returns {void}
 */
function hideError(input, errorElement) {
  input.classList.remove("outline-red-errors");
  input.classList.add("outline-grey-500");
  errorElement.classList.add("hidden");
}

/**
 * Shows an error message for a custom element (radio group or checkbox).
 * @param {HTMLElement} errorElement - The error span to display.
 * @returns {void}
 */
function showCustomError(errorElement) {
  errorElement.classList.remove("hidden");
}

/**
 * Hides the error message for a custom element (radio group or checkbox).
 * @param {HTMLElement} errorElement - The error span to hide.
 * @returns {void}
 */
function hideCustomError(errorElement) {
  errorElement.classList.add("hidden");
}

/**
 * Shows the success popup and hides it after 5 seconds.
 * @returns {void}
 */
function showSuccessPopup() {
  elements.successPopup.classList.remove("hidden");
  elements.successPopup.focus(); // focus for screen readers
  setTimeout(() => {
    elements.successPopup.classList.add("hidden");
    elements.submitButton.focus(); //return fucus to button
  }, 1500);
}

// ============================================================
// FIELD VALIDATORS
// ============================================================

/**
 * Validates a single field and shows/hides its error.
 * @param {HTMLInputElement|HTMLTextAreaElement} input - The input to validate.
 * @param {HTMLElement} errorElement - The error span for this input.
 * @param {Function} validatorFn - The validation function to use.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateField(input, errorElement, validatorFn) {
  if (!validatorFn(input)) {
    showError(input, errorElement);
    return false;
  }
  hideError(input, errorElement);
  return true;
}

/**
 * Validates a custom element (radio group or checkbox).
 * @param {HTMLInputElement|NodeListOf<HTMLInputElement>} input - The input to validate.
 * @param {HTMLElement} errorElement - The error span for this input.
 * @param {Function} validatorFn - The validation function to use.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateCustomField(input, errorElement, validatorFn) {
  if (!validatorFn(input)) {
    showCustomError(errorElement);
    return false;
  }
  hideCustomError(errorElement);
  return true;
}

// ============================================================
// FORM VALIDATION HANDLER
// ============================================================

/**
 * Validates all form fields and shows/hides errors accordingly.
 * @returns {boolean} True if all fields are valid, false otherwise.
 */
function validateForm() {
  const results = [
    validateField(
      elements.inputs.firstName,
      elements.errors.firstName,
      validateRequired,
    ),
    validateField(
      elements.inputs.lastName,
      elements.errors.lastName,
      validateRequired,
    ),
    validateField(elements.inputs.email, elements.errors.email, validateEmail),
    validateField(
      elements.inputs.message,
      elements.errors.message,
      validateRequired,
    ),
    validateCustomField(
      elements.inputs.queryType,
      elements.errors.queryType,
      validateQueryType,
    ),
    validateCustomField(
      elements.inputs.consent,
      elements.errors.consent,
      validateConsent,
    ),
  ];

  return results.every(Boolean);
}

// ============================================================
// SUBMIT HANDLER
// ============================================================

/**
 * Handles the form submission event.
 * Validates the form and shows the success popup if valid.
 * @param {SubmitEvent} e - The submit event.
 * @returns {void}
 */
function handleSubmit(e) {
  e.preventDefault();

  if (validateForm()) {
    showSuccessPopup();
    elements.form.reset();
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

/** @type {boolean} Flag to track if the form has been submitted at least once. */
let hasSubmitted = false;

elements.form.addEventListener("submit", (e) => {
  hasSubmitted = true;
  handleSubmit(e);
});

elements.inputs.firstName.addEventListener("blur", () => {
  if (!hasSubmitted) return;
  validateField(
    elements.inputs.firstName,
    elements.errors.firstName,
    validateRequired,
  );
});

elements.inputs.lastName.addEventListener("blur", () => {
  if (!hasSubmitted) return;
  validateField(
    elements.inputs.lastName,
    elements.errors.lastName,
    validateRequired,
  );
});

elements.inputs.email.addEventListener("blur", () => {
  if (!hasSubmitted) return;
  validateField(elements.inputs.email, elements.errors.email, validateEmail);
});

elements.inputs.message.addEventListener("blur", () => {
  if (!hasSubmitted) return;
  validateField(
    elements.inputs.message,
    elements.errors.message,
    validateRequired,
  );
});
