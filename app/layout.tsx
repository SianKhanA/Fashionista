import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FashionistA — Deshi elegance, made for you", template: "%s | FashionistA" },
  description: "Shop contemporary Bangladeshi sarees, kameez, kurtis and accessories. Delivered across Bangladesh.",
  metadataBase: new URL("https://fashionista.openai.site"),
  openGraph: { title: "FashionistA — Deshi elegance, made for you", description: "Contemporary Bangladeshi sarees, kameez, kurtis and accessories.", images: ["/og.png"] },
};
export const viewport: Viewport = { themeColor: "#722f45", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
