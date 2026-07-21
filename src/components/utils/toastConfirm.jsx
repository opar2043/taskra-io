import Swal from "sweetalert2";

/**
 * Confirmation dialog (SweetAlert2 modal).
 * Returns a Promise<boolean> that resolves true if the user confirms.
 *
 * A modal is used instead of a floating toast so it can never stack up or
 * overlap the page behind it — the user must resolve it before continuing.
 *
 * Usage:
 *   if (await confirmToast({ title: "Delete job?", confirmText: "Delete" })) {
 *     // proceed
 *   }
 */
export function confirmToast({
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = true,
} = {}) {
  return Swal.fire({
    title,
    text: message,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? "#E13B3B" : "#FE6D06",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
    focusCancel: danger,
  }).then((result) => result.isConfirmed);
}

/** Success modal. */
export function alertSuccess(title = "Success", message = "") {
  return Swal.fire({
    title,
    text: message,
    icon: "success",
    confirmButtonColor: "#FE6D06",
  });
}

/** Error modal. */
export function alertError(title = "Something went wrong", message = "") {
  return Swal.fire({
    title,
    text: message,
    icon: "error",
    confirmButtonColor: "#FE6D06",
  });
}

export default confirmToast;
