import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chay Fashion",
  description: "Modern styles for everyday wear. Quality fashion made accessible for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={
        {
          "--font-geist-sans": '"Segoe UI", Helvetica, Arial, sans-serif',
          "--font-geist-mono": '"Cascadia Code", "Courier New", monospace',
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
