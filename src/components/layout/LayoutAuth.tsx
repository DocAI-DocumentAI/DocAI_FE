import type React from "react"



export default function LayoutAuth({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">{children}</main>
    )
}
