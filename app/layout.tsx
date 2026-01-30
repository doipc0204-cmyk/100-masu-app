export const metadata = {
  title: '100マス・チャレンジ',
  description: '100回達成を目指すアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
