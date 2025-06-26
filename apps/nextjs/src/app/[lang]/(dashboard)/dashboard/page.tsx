import React from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@aeon/auth";

import { AeonDashboard } from "~/components/aeon-dashboard";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

// Force dynamic rendering for authentication-dependent pages
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "AEON Dashboard - AI Video Generation Platform",
  description: "Advanced Efficient Optimized Network for AI-powered video creation",
};

// export type ClusterType = RouterOutputs["k8s"]["getClusters"][number];
export default async function DashboardPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login-clerk");
  }

  const dict = await getDictionary(lang);

  return (
    <AeonDashboard
      user={{
        id: user.id,
        name: user.name || 'AEON User',
        email: user.email || '',
        image: user.image || undefined
      }}
    />
  );
}
