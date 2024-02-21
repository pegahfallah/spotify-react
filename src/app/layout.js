import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const red = Red_Hat_Display({ subsets: ["latin"] });

export const metadata = {
  title: "SpotAI",
  description: "See what AI thinks of your Taste in Music",
};

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <AuthProvider>
        <body className={red.className}>{children}</body>
      </AuthProvider>
    </html>

  );
}
