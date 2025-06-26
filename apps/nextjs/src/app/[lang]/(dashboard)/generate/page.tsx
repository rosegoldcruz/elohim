import React from "react";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@aeon/auth";

import { VideoGenerationWorkflow } from "~/components/video-generation-workflow";
import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";

export const metadata = {
  title: "Generate Video - AEON AI Platform",
  description: "Create AI-powered videos with AEON's modular agent system",
};

export default async function GeneratePage({
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
  
  return <VideoGenerationWorkflow />;
}
