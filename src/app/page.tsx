// /src/app/page.tsx
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Link from 'next/link';

export default async function HomePage() {
  // The createClient function no longer needs any arguments
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <Header user={user} />

      <main className="container mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold mt-10 mb-6">Welcome to the Deckbot!</h1>
        {user ? (
          <div>
            <p className="text-2xl text-gray-700">You are logged in.</p>
            <p className="text-xl text-gray-500 mt-2">Let's build a deck.</p>
            {/* The Deckbuilder component will be re-added here later */}
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-2xl text-gray-600">Please log in to get started.</p>
            <Link href="/login" className="mt-6 inline-block px-8 py-3 bg-violet-600 text-white font-bold text-lg rounded-full hover:bg-violet-700">
              Go to Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}