type Props = {
  title: string;
  description?: string;
  dark?: boolean;
};

export function EmptyState({ title, description, dark }: Props) {
  if (dark) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-700 px-6 py-12 text-center">
        <p className="text-base font-medium text-neutral-400">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 px-6 py-12 text-center">
      <p className="text-base font-medium text-neutral-500">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-neutral-400">{description}</p>
      )}
    </div>
  );
}
