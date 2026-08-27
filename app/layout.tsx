import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/store-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: { default: "FashionistA — Deshi elegance, made for you", template: "%s | FashionistA" },
  description: "Shop contemporary Bangladeshi sarees, kameez, kurtis and accessories. Delivered across Bangladesh.",
  metadataBase: new URL(siteUrl()),
  openGraph: { type:"website", siteName:"FashionistA", locale:"en_BD", title:"FashionistA — Deshi elegance, made for you", description:"Contemporary Bangladeshi sarees, kameez, kurtis and accessories.", images:[{ url:"/og.png", width:1200, height:630, alt:"FashionistA Bangladesh" }] },
  twitter: { card:"summary_large_image", title:"FashionistA — Deshi elegance, made for you", description:"Contemporary Bangladeshi sarees, kameez, kurtis and accessories.", images:["/og.png"] },
  robots: { index:true, follow:true },
};
export const viewport: Viewport = { themeColor: "#722f45", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><StoreProvider><SiteHeader/>{children}<SiteFooter/></StoreProvider></body></html>;
}
