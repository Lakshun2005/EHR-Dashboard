import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
        // Check if a profile already exists for this user
        const existingProfile = await prisma.profile.findUnique({
            where: { id: user.id },
        });

        // If no profile exists, create one
        if (!existingProfile) {
            await prisma.profile.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    firstName: user.user_metadata.full_name?.split(' ')[0] || '',
                    lastName: user.user_metadata.full_name?.split(' ')[1] || '',
                    // Default role can be set here if needed
                },
            });
        }

        return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}