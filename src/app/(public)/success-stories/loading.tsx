export default function SuccessStoriesLoading() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary to-primary/80 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="h-10 bg-white/20 rounded w-64 mx-auto animate-pulse" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
