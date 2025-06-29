import { NextResponse } from 'next/server'

export async function GET() {
  const htmlContent = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>Verification: 72675fdb9fd65deb</body>
</html>`

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400', // кэш на 1 день
    },
  })
} 