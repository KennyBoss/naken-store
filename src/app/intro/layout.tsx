import type { Metadata } from "next";
// import "./intro.css"; - This file has been deleted

export const metadata: Metadata = {
  title: "NAKEN - Добро пожаловать",
  description: "Стильная одежда для легендарных людей",
};

export default function IntroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 