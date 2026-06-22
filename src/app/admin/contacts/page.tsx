"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_KEY = "otter-pizza-admin-2024";

interface ContactSubmission {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contacts?page=${page}&limit=20`, {
        headers: { "x-admin-key": ADMIN_KEY },
      });
      if (!res.ok) throw new Error("Failed to fetch contact submissions");
      const data = await res.json();
      setSubmissions(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark">Contact Submissions</h2>
        <Button variant="outline" size="sm" onClick={fetchSubmissions}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={fetchSubmissions}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-border">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-muted bg-white rounded-xl border border-border">
              <MessageSquare className="w-10 h-10 mx-auto text-muted/40 mb-3" />
              <p>No contact submissions yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border shadow-sm">
              <div className="divide-y divide-border">
                {submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`w-full text-left p-4 hover:bg-warm-white/50 transition-colors ${
                      selectedSubmission?.id === sub.id
                        ? "bg-primary-light/30"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-dark truncate">
                          {sub.firstName} {sub.lastName}
                        </p>
                        <p className="text-xs text-muted mt-0.5 truncate">
                          {sub.email}
                        </p>
                        <p className="text-sm text-muted mt-1 line-clamp-2">
                          {sub.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(sub.createdAt).toLocaleDateString("en-SG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-xs text-muted">
                    {total} submission{total !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedSubmission ? (
            <div className="bg-white rounded-xl border border-border shadow-sm p-5 sticky top-24">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="p-2 rounded-full bg-primary-light text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">
                      {selectedSubmission.firstName} {selectedSubmission.lastName}
                    </h3>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedSubmission.createdAt).toLocaleString("en-SG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-dark">
                      Message
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-border">
                  <Button variant="primary" size="sm" asChild className="w-full">
                    <a
                      href={`mailto:${selectedSubmission.email}?subject=Re: Otter Pizza Contact`}
                    >
                      <Mail className="w-4 h-4" />
                      Reply via Email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-5 text-center">
              <Mail className="w-8 h-8 mx-auto text-muted/40 mb-2" />
              <p className="text-sm text-muted">
                Select a submission to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
