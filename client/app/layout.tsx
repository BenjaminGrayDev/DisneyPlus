import "../styles/globals.css";
import { Inter } from "@next/font/google";
import Navbar from "../components/sections/navbar";
// import { UserProvider } from "../context/UserContext";


const inter = Inter({
  subsets: ["latin"],
});



const Layout = async ({ children }: { children: React.ReactNode })  => {

  return (
    <html lang="en" className="bg-background-dark text-typography-light">
      <head />
      <body className={inter.className}>

          <div className="grid tablet:grid-cols-[auto,1fr]">
            <aside className="hidden tablet:block">
              <Navbar.Vertical />
            </aside>
            <main className="min-h-screen overflow-hidden tablet:overflow-visible">
              {children}
            </main>
            <Navbar.Horizontal />
          </div>

      </body>
    </html>
  );
};

export default Layout;
