"use client";

import Link from "next/link";
import { ArrowLeft, Shield, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export function ForgotPasswordForm() {
  return (
    <Card className="w-full max-w-md border-border/80 shadow-xl">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="size-7" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Forgot password
          </CardTitle>
          <CardDescription>{APP_NAME}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border border-border bg-muted/40 p-4 text-left">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <UserCog className="size-4 text-secondary" />
            Contact your Administrator
          </div>
          <p className="text-sm text-muted-foreground">
            Password resets are handled by an Administrator from the{" "}
            <span className="font-medium text-foreground">Users</span> page.
            They will give you a temporary password so you can sign in and set a
            new one.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Email reset is not enabled for this deployment. Please reach out to
          your site administrator for help.
        </p>

        <Link href="/login" className="block">
          <Button className="w-full bg-secondary hover:bg-secondary/90">
            <ArrowLeft className="size-4" />
            Back to login
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
