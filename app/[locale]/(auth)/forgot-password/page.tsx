"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ErrorMessage } from "@/components/ui/error-message";
import { Icon } from "@iconify/react";

const forgotPasswordSchema = z.object({
  email: z.string().email("請輸入有效的 Email 地址"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");
    setIsLoading(true);

    try {
      // TODO: 實作忘記密碼 API
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "發送重設密碼郵件失敗");
        return;
      }

      setSuccess(true);
    } catch {
      setError("發送重設密碼郵件時發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Icon
                  icon="mdi:email-check"
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              郵件已發送
            </CardTitle>
            <CardDescription className="text-center">
              我們已將重設密碼的連結發送到您的 Email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              請檢查您的收件匣（包括垃圾郵件資料夾），並點擊郵件中的連結來重設密碼。
            </p>
            <Button onClick={() => router.push("/login")} className="w-full">
              返回登入頁面
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            忘記密碼
          </CardTitle>
          <CardDescription className="text-center">
            輸入您的 Email，我們將發送重設密碼的連結
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <ErrorMessage message={error} type="error" className="mb-4" />
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "發送中..." : "發送重設連結"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className="text-sm"
            >
              返回登入頁面
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
