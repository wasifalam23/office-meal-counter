import type { ReactNode } from "react";

type ConfirmationModalProps = {
  cancelLabel: string;
  confirmLabel: string;
  confirmTitle: string;
  disabled?: boolean;
  message: ReactNode;
  titleId: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  cancelLabel,
  confirmLabel,
  confirmTitle,
  disabled = false,
  message,
  titleId,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#20201d]/45 px-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg border border-[#d8d0c2] bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f9ebe8] text-xl font-bold text-[#8a382d]">
            !
          </div>
          <div>
            <h2 className="text-xl font-bold" id={titleId}>
              {confirmTitle}
            </h2>
            <div className="mt-2 text-sm leading-6 text-[#6f6a61]">
              {message}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-[#cfc6b7] px-5 py-3 text-sm font-bold text-[#20201d] transition hover:bg-[#f6f3ec] disabled:cursor-not-allowed disabled:text-[#9d968a]"
            disabled={disabled}
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-md bg-[#8a382d] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#733025] disabled:cursor-not-allowed disabled:bg-[#d1a59d]"
            disabled={disabled}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
