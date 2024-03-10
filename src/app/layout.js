
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";


export const metadata = {
  title: "SpotAI",
  description: "See what AI thinks of your Taste in Music",
};

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <AuthProvider>
        <body >{children}</body>
      </AuthProvider>
    </html>

  );
}
