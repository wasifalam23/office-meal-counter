type StatusMessageProps = {
  error: string;
  message: string;
};

export function StatusMessage({ error, message }: StatusMessageProps) {
  if (!message && !error) {
    return null;
  }

  return (
    <div className="rounded-md border border-[#d8d0c2] bg-white px-4 py-3 text-sm shadow-sm">
      {message ? <p className="font-bold text-[#25765a]">{message}</p> : null}
      {error ? <p className="font-bold text-[#8a382d]">{error}</p> : null}
    </div>
  );
}
