export const runtime = "nodejs";

import { notFound } from "next/navigation";

import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
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

  const { data: post } = await supabase
    .from("educational_content")
    .select("title, content, category, published_at")
    .eq("slug", params.slug)
    .single();

  if (!post) return notFound();

  return (
    <AppShell
      title={post.title}
      user={{
        name: profile?.artist_name ?? null,
        email: user?.email ?? null,
        plan: null,
      }}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <Badge variant="outline" className="capitalize">
          {post.category ?? "general"}
        </Badge>
        <span>•</span>
        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : "Draft"}</span>
      </div>

      <Card className="mt-6">
        <CardContent className="prose prose-invert max-w-none space-y-6 py-8">
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content ?? "") }} />
        </CardContent>
      </Card>
    </AppShell>
  );
}

function markdownToHtml(content: string) {
  if (!content) return "<p class=\"text-muted\">This article is being tuned. Check back soon!</p>";
  return content
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}


