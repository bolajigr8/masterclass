export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

export const metadata = {
  title: 'Admin Dashboard - Masterclass',
  description: 'Event management and attendance tracking',
}
