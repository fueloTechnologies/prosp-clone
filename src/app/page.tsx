// src/app/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingPage from "../components/landing-page";
export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If logged in → dashboard/sequences
  if (session) {
    redirect("/sequences");
  }

  // If NOT logged in → show landing page
  return <LandingPage />;
}
