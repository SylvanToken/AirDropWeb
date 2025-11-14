export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No authentication check here - this is for login page
  return <>{children}</>;
}
