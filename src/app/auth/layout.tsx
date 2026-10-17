import type { Metadata } from "next";
import "../globals.css";
import { SITE_URL } from "@/lib/site";

const themeInitializationScript = `
  (function () {
    try {
      var storedTheme = localStorage.getItem("theme");
      var isDark = storedTheme === "dark" ||
        (storedTheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    } catch (error) {
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PlanIt",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-site-bg font-sans text-site-text antialiased selection:bg-brand/25 selection:text-site-text"
      >
        {children}
      </body>
    </html>
  );
}
