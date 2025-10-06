'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChromeIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="flex justify-center">
            <Image
                src="/placeholder-logo.svg"
                alt="EHR Dashboard Logo"
                width={60}
                height={60}
            />
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome</CardTitle>
            <CardDescription>Sign in to your EHR Dashboard account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full text-lg py-6"
                variant="outline"
              >
                {loading ? (
                  'Redirecting...'
                ) : (
                  <>
                    <ChromeIcon className="w-6 h-6 mr-3" />
                    Continue with Google
                  </>
                )}
              </Button>
              {error && (
                <p className="text-sm text-red-600 text-center pt-2">{error}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
             <p className="text-xs text-gray-500 text-center w-full">
                By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}