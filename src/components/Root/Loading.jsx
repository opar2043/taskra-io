const Loading = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <span className="w-10 h-10 rounded-full border-[3px] border-primary-tint border-t-primary animate-spin" />
      <p className="text-sm font-medium text-body-text/70">Loading…</p>
    </div>
  );
};

export default Loading;
