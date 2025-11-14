export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is a minimal layout for all admin routes
  // Authentication is handled by middleware
  // Specific layouts are in route groups: (auth) and (dashboard)
  return <>{children}</>;
}
