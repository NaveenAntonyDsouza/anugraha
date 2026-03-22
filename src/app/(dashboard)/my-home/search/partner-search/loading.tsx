export default function SearchLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-4">
      <div className="h-12 bg-muted rounded-lg animate-pulse w-full max-w-md" />
      <div className="h-10 bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-72 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
