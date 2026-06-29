export function LoadingState() {
  return <div className="rounded-xl border border-beige bg-white p-6 text-muted">Đang tải dữ liệu...</div>;
}

export function ErrorState({ message = "Không thể tải dữ liệu" }: { message?: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{message}</div>;
}

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-beige bg-white p-8 text-center">
      <p className="font-semibold text-charcoal">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
