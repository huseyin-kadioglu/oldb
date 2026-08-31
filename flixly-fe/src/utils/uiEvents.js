/** Uygulama geneli UI olayları — alert yerine panel / toast */

import COPY from "../copy";

export const showToast = (message, { actionLabel, actionHref, duration = 3200 } = {}) => {
  if (!message) return;
  window.dispatchEvent(
    new CustomEvent("oldb:toast", {
      detail: { message, actionLabel, actionHref, duration },
    })
  );
};

export const toastProfileAction = (listType) => {
  const username = sessionStorage.getItem("username");
  if (!username) return {};
  if (listType === "library") {
    return {
      actionLabel: COPY.toast.seeLibrary,
      actionHref: `/profile/${username}/list/library`,
    };
  }
  return {
    actionLabel: COPY.toast.seeProfile,
    actionHref: `/profile/${username}`,
  };
};
