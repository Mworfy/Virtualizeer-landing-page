"use strict";

const FORM_CONFIG = {
  endpoint: "" // demo copy: submissions disabled, see https://ysf.aiesecus.org/
};

const PARTNERSHIP_TYPES = new Set(["partner", "speaker", "sponsor"]);

function parseJsonSafe(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

async function postRegistration(payload) {
  const response = await fetch(FORM_CONFIG.endpoint, {
    method: "POST",
    mode: "cors",
    credentials: "omit",
    redirect: "follow",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const text = await response.text();
  const result = parseJsonSafe(text);

  if (result.success) {
    return result;
  }

  if (result.status === "ok" && result.success !== true) {
    throw new Error("The server received a lookup instead of your registration. Please try again.");
  }

  throw new Error(result.error || "Submission failed.");
}

function initRegistrationForms() {
  const hosts = [
    ...document.querySelectorAll("[data-form-modal]"),
    ...document.querySelectorAll("[data-form-page]")
  ];
  if (!hosts.length) return;

  const overlay = document.querySelector("[data-form-overlay]");
  const isStandalone = (host) => host.hasAttribute("data-form-page");
  let activeModal = null;
  let lastFocusedElement = null;

  const getModal = (name) =>
    hosts.find((host) => host.dataset.formModal === name || host.dataset.formPage === name);

  const getFocusableElements = (modal) =>
    [...modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )].filter((element) => element.offsetParent !== null || element === document.activeElement);

  const showFeedback = (form, message) => {
    const feedback = form.querySelector("[data-form-feedback]");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = !message;
    if (message) {
      feedback.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  const resetModal = (modal) => {
    const formPanel = modal.querySelector('[data-form-panel="form"]');
    const submittingPanel = modal.querySelector('[data-form-panel="submitting"]');
    const successPanel = modal.querySelector('[data-form-panel="success"]');
    const form = modal.querySelector("[data-registration-form]");

    if (formPanel) formPanel.hidden = false;
    if (submittingPanel) submittingPanel.hidden = true;
    if (successPanel) successPanel.hidden = true;
    modal.classList.remove("is-submitting");
    document.body.classList.remove("is-form-submitting");
    if (overlay) overlay.hidden = true;
    form?.reset();
    form?.querySelectorAll("[aria-invalid]").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });
    if (form) showFeedback(form, "");
  };

  const setSubmittingState = (modal, isSubmitting) => {
    const formPanel = modal.querySelector('[data-form-panel="form"]');
    const submittingPanel = modal.querySelector('[data-form-panel="submitting"]');

    if (formPanel) formPanel.hidden = isSubmitting;
    if (submittingPanel) submittingPanel.hidden = !isSubmitting;
    modal.classList.toggle("is-submitting", isSubmitting);
    document.body.classList.toggle("is-form-submitting", isSubmitting);
    if (overlay) overlay.hidden = !isSubmitting;
    if (isSubmitting) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeModal = (modal) => {
    if (!modal || modal.classList.contains("is-submitting")) return;
    if (isStandalone(modal)) {
      window.location.href = "./site.html";
      return;
    }
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    activeModal = null;
    resetModal(modal);
    lastFocusedElement?.focus?.();
    lastFocusedElement = null;
    if (/^(register|delegate|partner)$/i.test(location.hash.slice(1))) {
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
  };

  const openModal = (name) => {
    const modal = getModal(name);
    if (!modal || isStandalone(modal)) return;

    lastFocusedElement = document.activeElement;
    hosts.forEach((item) => {
      if (isStandalone(item)) return;
      item.hidden = item !== modal;
    });
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
    activeModal = modal;

    const focusTarget =
      modal.querySelector(".form-modal__close") ||
      modal.querySelector("input, textarea, button");
    focusTarget?.focus();
  };

  const validateForm = (form) => {
    let valid = true;

    form.querySelectorAll("[required]").forEach((field) => {
      let fieldValid = true;

      if (field.type === "checkbox") {
        fieldValid = field.checked;
      } else if (field.tagName === "SELECT") {
        fieldValid = Boolean(field.value.trim());
      } else {
        fieldValid = Boolean(field.value.trim());
      }

      if (field.type === "email" && field.value.trim()) {
        fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }

      if (field.type === "number" && field.value.trim()) {
        const value = Number(field.value);
        const min = field.min ? Number(field.min) : null;
        const max = field.max ? Number(field.max) : null;
        fieldValid =
          Number.isFinite(value) &&
          (min === null || value >= min) &&
          (max === null || value <= max);
      }

      field.setAttribute("aria-invalid", fieldValid ? "false" : "true");
      if (!fieldValid) valid = false;
    });

    return valid;
  };

  const buildPayload = (form) => {
    const formData = new FormData(form);
    const payload = {
      formType: formData.get("formType"),
      submittedAt: new Date().toISOString()
    };

    formData.forEach((value, key) => {
      if (key === "formType") return;
      if (key === "gdprConsent") {
        payload[key] = value === "yes" || value === "true" || value === "on";
        return;
      }
      payload[key] = typeof value === "string" ? value.trim() : value;
    });

    if (!Object.prototype.hasOwnProperty.call(payload, "gdprConsent")) {
      payload.gdprConsent = false;
    }

    return payload;
  };

  const showSuccess = (modal, form, result = {}) => {
    const formPanel = modal.querySelector('[data-form-panel="form"]');
    const submittingPanel = modal.querySelector('[data-form-panel="submitting"]');
    const successPanel = modal.querySelector('[data-form-panel="success"]');
    const successMessage = successPanel?.querySelector("[data-form-success-message]");
    const formType = form?.querySelector('[name="formType"]')?.value;
    const emailSent = result.emailSent !== false;

    if (successMessage) {
      if (formType && formType !== "delegate") {
        const labels = {
          partner: "partner",
          speaker: "speaker",
          sponsor: "sponsor"
        };
        successMessage.textContent = emailSent
          ? `We received your ${labels[formType] || "partnership"} inquiry. A confirmation email is on its way.`
          : `We received your ${labels[formType] || "partnership"} inquiry. We will be in touch soon.`;
      } else {
        successMessage.textContent = emailSent
          ? "We received your delegate registration. A confirmation email is on its way."
          : "We received your delegate registration. We will be in touch soon.";
      }
    }

    if (formPanel) formPanel.hidden = true;
    if (submittingPanel) submittingPanel.hidden = true;
    if (successPanel) successPanel.hidden = false;
    modal.classList.remove("is-submitting");
    document.body.classList.remove("is-form-submitting");
    if (overlay) overlay.hidden = true;
    successPanel?.querySelector(".button")?.focus();
    successPanel?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const submitForm = async (form, modal) => {
    if (modal.classList.contains("is-submitting")) return;

    if (!validateForm(form)) {
      showFeedback(form, "Please complete all required fields correctly.");
      return;
    }

    const payload = buildPayload(form);
    if ((modal.dataset.formModal === "partner" || modal.dataset.formPage === "partner") && !PARTNERSHIP_TYPES.has(payload.formType)) {
      showFeedback(form, "Please select a partnership type.");
      return;
    }

    if (!FORM_CONFIG.endpoint) {
      showFeedback(form, "This is a demo copy hosted by Virtualizeer, so registration is turned off here. Please register on the live site: ysf.aiesecus.org");
      return;
    }

    const submitButton = form.querySelector("[data-form-submit]");
    if (submitButton) submitButton.disabled = true;
    showFeedback(form, "");
    setSubmittingState(modal, true);

    try {
      const result = await postRegistration(payload);
      showSuccess(modal, form, result);
    } catch (error) {
      setSubmittingState(modal, false);
      showFeedback(form, error.message || "Something went wrong. Please try again.");
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };

  document.querySelectorAll("[data-open-form]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openModal(trigger.dataset.openForm);
    });
  });

  hosts.forEach((modal) => {
    modal.querySelectorAll("[data-close-form]").forEach((trigger) => {
      trigger.addEventListener("click", () => closeModal(modal));
    });

    const form = modal.querySelector("[data-registration-form]");
    if (!form) return;

    form.setAttribute("action", "#");
    form.setAttribute("method", "post");
    form.setAttribute("novalidate", "");

    const onSubmit = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      submitForm(form, modal);
      return false;
    };

    form.addEventListener("submit", onSubmit, true);
    form.querySelector("[data-form-submit]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSubmit(event);
    });
  });

  const hashForm = location.hash.replace("#", "").toLowerCase();
  if (hashForm === "register" || hashForm === "delegate") {
    openModal("delegate");
  } else if (hashForm === "partner") {
    openModal("partner");
  }

  document.addEventListener("keydown", (event) => {
    if (!activeModal) return;

    if (event.key === "Escape") {
      if (activeModal.classList.contains("is-submitting")) return;
      event.preventDefault();
      closeModal(activeModal);
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = getFocusableElements(activeModal);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  initRegistrationForms();
});
