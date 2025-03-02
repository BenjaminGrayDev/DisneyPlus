"use client";

import "../styles/globals.css";
import { Inter } from "@next/font/google";
import Navbar from "../components/sections/navbar";
import { usePathname } from "next/navigation";
import { UserProvider } from "../context/UserContext";

const inter = Inter({
  subsets: ["latin"],
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isAuthPage = pathname === "/auth/signin" || pathname === "/auth/signup"; // ✅ Check for both signin & signup

  return (
    <html lang="en" className="bg-background-dark text-typography-light">
      <head />
      <body className={inter.className}>
        <UserProvider>
          <div className={!isAuthPage ? "grid tablet:grid-cols-[auto,1fr]" : ""}>
            {!isHomePage && !isAuthPage && (
              <aside className="hidden tablet:block">
                <Navbar.Vertical />
              </aside>
            )}
            <main className="min-h-screen overflow-hidden tablet:overflow-visible">
              {children}
            </main>
            {!isHomePage && !isAuthPage && <Navbar.Horizontal />}
          </div>
        </UserProvider>
      </body>
    </html>
  );
};

export default Layout;
