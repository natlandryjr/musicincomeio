export const runtime = "nodejs";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calendar } from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

const categoryVariants: Record<string, "accent" | "secondary" | "outline" | "muted"> = {
  royalties: "secondary",
  registration: "accent",
  tax: "outline",
  general: "muted",
};

export default async function LibraryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile =
    user === null
      ? null
      : (
          await supabase
            .from("users")
            .select("artist_name")
            .eq("id", user.id)
            .single<{ artist_name: string | null }>()
        ).data;

  const { data: posts } = await supabase
    .from("educational_content")
    .select("title, slug, category, published_at")
    .order("published_at", { ascending: false });

  return (
    <AppShell
      title="Library"
      user={{
        name: profile?.artist_name ?? null,
        email: user?.email ?? null,
        plan: null,
      }}
    >
      <p className="text-sm text-muted">
        Plain-English guides to royalties, registrations, neighboring rights, taxes, and everything in between.
      </p>

      {!posts?.length ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted">
            <BookOpen className="h-8 w-8 text-muted" aria-hidden="true" />
            <p>No articles yet. Sit tight—we’re composing the first arrangements.</p>
          </CardContent>
        </Card>
      ) : (
        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-8 grid gap-5 md:grid-cols-2"
        >
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/library/${post.slug}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-brand">
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <Badge
                        variant={categoryVariants[post.category ?? ""] ?? "muted"}
                        className="capitalize"
                      >
                        {post.category ?? "general"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : "Coming soon"}
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold leading-tight group-hover:text-secondary">
                      {post.title}
                    </h2>
                    <div className="mt-auto flex items-center gap-2 text-xs text-muted">
                      <span className="h-2 w-2 rounded-full bg-secondary" />
                      5 minute read • Actionable steps inside
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </AppShell>
  );
}


