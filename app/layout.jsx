import "./globals.css";

export const metadata = {
  title: "File Renamer",
  description: "A Next.js app for downloading multiple browser-selected files with sequential names.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
