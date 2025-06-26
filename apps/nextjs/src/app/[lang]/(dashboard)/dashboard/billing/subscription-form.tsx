"use client";

import Link from "next/link";

import { cn } from "@aeon/ui";
import { buttonVariants } from "@aeon/ui/button";

export function SubscriptionForm(props: {
  hasSubscription: boolean;
  dict: Record<string, string>;
}) {
  return (
    <Link href="/pricing" className={cn(buttonVariants())}>
      {props.hasSubscription
        ? props.dict.manage_subscription
        : props.dict.upgrade}
    </Link>
  );
}
