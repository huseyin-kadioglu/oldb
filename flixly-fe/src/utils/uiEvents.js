/** Uygulama geneli UI olayları — alert yerine panel / toast */

export const showToast = (message, { actionLabel, actionHref, duration = 3200 } = {}) => {
  window.dispatchEvent(
    new CustomEvent("oldb:toast", {
      detail: { message, actionLabel, actionHref, duration },
    })
  );
};
