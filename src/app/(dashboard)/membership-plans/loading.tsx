export default function MembershipPlansLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="h-8 bg-muted rounded w-64 mx-auto animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-72 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
