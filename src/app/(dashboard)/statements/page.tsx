import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStatements } from "@/lib/db/statements";
import { StatementCard, StatementUploader } from "@/components/statements";
import { FileText, Upload } from "lucide-react";

export default async function StatementsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const statements = await getStatements(user.id);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8" />
          Statement Archive
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your imported royalty statements and track parsing results
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Total Statements
          </p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {statements.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            Total Entries
          </p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
            {statements.reduce((sum, s) => sum + (s.parsed_entries_count || 0), 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            Last Upload
          </p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1">
            {statements.length > 0
              ? new Date(statements[0].created_at).toLocaleDateString()
              : "Never"}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <StatementUploader />

      {/* Statements List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Statements</h2>
        {statements.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              No statements yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload your first CSV statement to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {statements.map((statement) => (
              <StatementCard key={statement.id} statement={statement} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
