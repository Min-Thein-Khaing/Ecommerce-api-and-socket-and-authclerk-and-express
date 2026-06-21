import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "Atelier — Shop & Chat",
  description: "A curated marketplace with direct seller chat",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en"><body>{children}</body></html>
    </ClerkProvider>
  );
}
