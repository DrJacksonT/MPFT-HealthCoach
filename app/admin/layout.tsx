import { notFound } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEV_ADMIN !== "true"
  )
    notFound();
  return children;
}
