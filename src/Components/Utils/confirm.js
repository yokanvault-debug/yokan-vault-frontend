import Swal from 'sweetalert2';

// Styled confirm dialog (replaces the browser's "localhost says..." box). Resolves true / false.
export const confirmAction = ({ title = 'Are you sure?', text = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = {}) =>
  Swal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: danger,
    buttonsStyling: false,
    customClass: {
      popup: 'yk-swal',
      title: 'yk-swal-title',
      htmlContainer: 'yk-swal-text',
      actions: 'yk-swal-actions',
      confirmButton: danger ? 'yk-swal-confirm danger' : 'yk-swal-confirm',
      cancelButton: 'yk-swal-cancel',
    },
  }).then((result) => result.isConfirmed);

export const requestCancellationReason = async (orderNumber) => {
  const result = await Swal.fire({
    title: 'Cancel Order',
    html: `Are you sure you want to cancel order <strong>${orderNumber}</strong>? This action cannot be undone. Please provide a reason for cancellation.`,
    input: 'textarea',
    inputLabel: 'Reason for Cancellation',
    inputPlaceholder: 'Enter your reason (required)',
    inputAttributes: { maxlength: '500', 'aria-label': 'Reason for Cancellation' },
    inputValidator: (value) => {
      if (typeof value !== 'string' || !value.trim()) return 'A cancellation reason is required.'
      if (value.trim().length > 500) return 'The reason cannot exceed 500 characters.'
    },
    showCancelButton: true,
    confirmButtonText: 'Confirm Cancellation',
    cancelButtonText: 'Keep Order',
    focusCancel: true,
    buttonsStyling: false,
    customClass: {
      popup: 'yk-swal',
      title: 'yk-swal-title',
      htmlContainer: 'yk-swal-text',
      input: 'form-control',
      actions: 'yk-swal-actions',
      confirmButton: 'yk-swal-confirm danger',
      cancelButton: 'yk-swal-cancel',
    },
  })
  return result.isConfirmed ? result.value.trim() : null
}
