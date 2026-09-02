type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-beige bg-white p-6 shadow-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
          !
        </div>
        <h2 className="mt-4 text-xl font-bold text-charcoal">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-lg border border-beige px-4 py-2 text-sm font-semibold text-muted hover:bg-ivory disabled:opacity-60"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Đang xoá..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
