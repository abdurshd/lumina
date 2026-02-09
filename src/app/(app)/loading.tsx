export default function AppLoading() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}
