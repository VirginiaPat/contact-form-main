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
// DOM HELPERS
// ============================================================

/**
 * Returns an element by id or throws a descriptive error if not found.
 * @param {string} id - The id of the element to find.
 * @returns {HTMLElement} The found element.
 * @throws {Error} If the element is not found.
 */
const requireById = (id) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element with id="${id}"`);
  return el;
};

// ============================================================
// SELECTORS
// ============================================================

/** @type {FormElements} */
const elements = {
  form:
    document.querySelector("form") ??
    (() => {
      throw new Error("Missing form element");
    })(),

  inputs: {
    firstName: requireById("firstName"),
    lastName: requireById("lastName"),
    email: requireById("email"),
    queryType: document.querySelectorAll('input[name="queryType"]'),
    message: requireById("message"),
    consent: requireById("consent"),
  },

  errors: {
    firstName: requireById("firstName-error"),
    lastName: requireById("lastName-error"),
    email: requireById("email-error"),
    queryType: requireById("queryType-error"),
    message: requireById("message-error"),
    consent: requireById("consent-error"),
  },

  submitButton: requireById("submit-button"),
  successPopup: requireById("success-popup"),
};

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validates a required text input field.
 * @param {HTMLInputElement} input - The input element to validate.
 * @returns {boolean} True if the field is not empty, false otherwise.
 */
const validateRequired = (input) => {
  return input.value.trim().length > 0;
};

/**
 * Validates the email input field.
 * @param {HTMLInputElement} input - The email input element to validate.
 * @returns {boolean} True if the email format is valid, false otherwise.
 */
const validateEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.value.trim());
};

/**
 * Validates that at least one query type radio button is selected.
 * @param {NodeListOf<HTMLInputElement>} inputs - The radio button elements.
 * @returns {boolean} True if one is selected, false otherwise.
 */
const validateQueryType = (inputs) => {
  return [...inputs].some((input) => input.checked);
};

/**
 * Validates the consent checkbox.
 * @param {HTMLInputElement} input - The checkbox element to validate.
 * @returns {boolean} True if the checkbox is checked, false otherwise.
 */
const validateConsent = (input) => {
  return input.checked;
};

// ============================================================
// UI FUNCTIONS
// ============================================================

/**
 * Shows an error message for a given input field.
 * @param {HTMLElement} input - The input element to mark as invalid.
 * @param {HTMLElement} errorElement - The error span to display.
 * @returns {void}
 */
const showError = (input, errorElement) => {
  input.classList.add("outline-red-errors");
  input.classList.remove("outline-grey-500");
  input.setAttribute("aria-invalid", "true");
  errorElement.classList.remove("hidden");
};

/**
 * Hides the error message for a given input field.
 * @param {HTMLElement} input - The input element to mark as valid.
 * @param {HTMLElement} errorElement - The error span to hide.
 * @returns {void}
 */
const hideError = (input, errorElement) => {
  input.classList.remove("outline-red-errors");
  input.classList.add("outline-grey-500");
  input.removeAttribute("aria-invalid");
  errorElement.classList.add("hidden");
};

/**
 * Shows an error message for a custom element (radio group or checkbox).
 * @param {HTMLElement} errorElement - The error span to display.
 * @returns {void}
 */
const showCustomError = (input, errorElement) => {
  input.setAttribute("aria-invalid", "true");
  errorElement.classList.remove("hidden");
};

/**
 * Hides the error message for a custom element (radio group or checkbox).
 * @param {HTMLElement} errorElement - The error span to hide.
 * @returns {void}
 */
const hideCustomError = (input, errorElement) => {
  input.removeAttribute("aria-invalid");
  errorElement.classList.add("hidden");
};

/** @type {HTMLElement|null} Stores the element that triggered the popup */
let lastFocused = null;

/**
 * Shows the success popup and moves focus into it.
 * Saves the previously focused element to restore later.
 * @returns {void}
 */
const showSuccessPopup = () => {
  lastFocused = document.activeElement;
  elements.successPopup.classList.remove("hidden");
  elements.successPopup.setAttribute("aria-hidden", "false");
  setTimeout(() => elements.successPopup.focus(), 50);
  setTimeout(() => hideSuccessPopup(), 2000);
};

/**
 * Hides the success popup and returns focus to the triggering element.
 * @returns {void}
 */
const hideSuccessPopup = () => {
  elements.successPopup.classList.add("hidden");
  elements.successPopup.setAttribute("aria-hidden", "true");
  if (lastFocused && typeof lastFocused.focus === "function") {
    lastFocused.focus();
  }
};

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
const validateField = (input, errorElement, validatorFn) => {
  if (!validatorFn(input)) {
    showError(input, errorElement);
    return false;
  }
  hideError(input, errorElement);
  return true;
};

/**
 * Validates a custom element (radio group or checkbox).
 * @param {HTMLElement} representativeInput - The representative input for aria-invalid.
 * @param {HTMLElement|NodeListOf<HTMLInputElement>} validationInput - The input(s) to validate.
 * @param {HTMLElement} errorElement - The error span for this input.
 * @param {Function} validatorFn - The validation function to use.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateCustomField(
  representativeInput,
  validationInput,
  errorElement,
  validatorFn,
) {
  if (!validatorFn(validationInput)) {
    showCustomError(representativeInput, errorElement);
    return false;
  }
  hideCustomError(representativeInput, errorElement);
  return true;
}

// ============================================================
// FORM VALIDATION HANDLER
// ============================================================

/**
 * Validates all form fields and shows/hides errors accordingly.
 * @returns {{ isValid: boolean, firstInvalid: HTMLElement|null }}
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
      elements.inputs.queryType[0],
      elements.inputs.queryType,
      elements.errors.queryType,
      validateQueryType,
    ),

    validateCustomField(
      elements.inputs.consent,
      elements.inputs.consent,
      elements.errors.consent,
      validateConsent,
    ),
  ];

  const isValid = results.every(Boolean);

  const allInputs = [
    elements.inputs.firstName,
    elements.inputs.lastName,
    elements.inputs.email,
    elements.inputs.message,
    elements.inputs.queryType[0],
    elements.inputs.consent,
  ];

  const firstInvalid =
    allInputs.find((input) => input.getAttribute("aria-invalid") === "true") ??
    null;

  return { isValid, firstInvalid };
}

// ============================================================
// SUBMIT HANDLER
// ============================================================

/**
 * Handles the form submission event.
 * Validates the form, focuses first invalid field, or shows success popup.
 * @param {SubmitEvent} e - The submit event.
 * @returns {void}
 */
const handleSubmit = (e) => {
  e.preventDefault();

  const { isValid, firstInvalid } = validateForm();

  if (!isValid) {
    firstInvalid?.focus(); // focus first invalid field
    return;
  }

  showSuccessPopup();
  elements.form.reset();
};

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

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    elements.successPopup.getAttribute("aria-hidden") === "false"
  ) {
    hideSuccessPopup();
  }
});

document.addEventListener("click", () => {
  if (elements.successPopup.getAttribute("aria-hidden") === "false") {
    hideSuccessPopup();
  }
});
