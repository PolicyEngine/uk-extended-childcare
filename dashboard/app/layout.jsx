import "./globals.css";

export const metadata = {
  title: "Universal Family Childcare Promise | PolicyEngine",
  description:
    "Interactive dashboard scoring the New Economics Foundation's Universal Family Childcare Promise — a universal 15-hour entitlement for children from 9 months to 4 years, plus an earnings cost cap — using PolicyEngine UK microsimulation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
