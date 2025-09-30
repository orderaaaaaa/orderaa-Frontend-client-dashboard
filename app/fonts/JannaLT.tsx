import localFont from "next/font/local";

export const janna = localFont({
  src: [
    { path: "../public/fonts/JannaLT-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/JannaLT-Bold.woff2",    weight: "700", style: "normal" },
  ],
  variable: "--font-janna",
  display: "swap",
});