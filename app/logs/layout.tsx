import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity Logs | Admin Dashboard",
  description: "View and manage activity logs and audit trail",
};

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
