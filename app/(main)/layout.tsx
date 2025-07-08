import MainNavigation from '@/components/layout/MainNavigation'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MainNavigation />
      {children}
    </>
  )
}