"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bug, Filter, Search, AlertCircle, CheckCircle, Clock, XCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getBugReports, type Bug } from "@/lib/api/bug";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

const SEVERITY_COLORS = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
};

const STATUS_COLORS = {
  open: "bg-blue-500/10 text-blue-500",
  "in-progress": "bg-yellow-500/10 text-yellow-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-gray-500/10 text-gray-500",
};

const STATUS_ICONS = {
  open: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle,
  closed: XCircle,
};

export default function AdminBugsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState({
    status: "",
    assignedTo: "",
    severity: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push("/login?returnUrl=/admin/bugs");
        return;
      }
      // Check if user is admin
      if (user?.role !== 'admin') {
        toast.error("Admin access required");
        router.push("/");
        return;
      }
      loadBugs();
    }
  }, [isAuthenticated, isAuthLoading, user, page, filters]);

  const loadBugs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBugReports(page, 20, {
        status: filters.status || undefined,
        assignedTo: filters.assignedTo || undefined,
        severity: filters.severity || undefined,
      });
      setBugs(data.bugs);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error("Failed to load bugs:", err);
      setError(err.message || "Failed to load bug reports");
      toast.error("Failed to load bug reports");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBugs = bugs.filter((bug) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bug.title.toLowerCase().includes(query) ||
      bug.description.toLowerCase().includes(query) ||
      bug.reportedByName?.toLowerCase().includes(query) ||
      bug.assignedTo?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <LoadingSpinner message="Loading..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              >
                <ArrowLeft className="h-5 w-5 text-[var(--text)]" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--orange)]/10">
                  <Bug className="h-6 w-6 text-[var(--orange)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text)]">
                    Bug Reports
                  </h1>
                  <p className="text-sm text-[var(--text-subtle)]">
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/analytics"
                className="px-4 py-2 rounded-lg border transition-colors flex items-center gap-2"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text)",
                  backgroundColor: "var(--bg-hover)",
                }}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </div>
            <div className="text-sm text-[var(--text-subtle)]">
              Total: {pagination.total} bugs
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-subtle)]" />
            <input
              type="text"
              placeholder="Search bugs by title, description, reporter, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
              style={{
                backgroundColor: "var(--bg-hover)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          {/* Filter Options */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--text-subtle)]" />
              <span className="text-sm text-[var(--text-subtle)]">Filters:</span>
            </div>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
              style={{
                backgroundColor: "var(--bg-hover)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filters.severity}
              onChange={(e) => {
                setFilters({ ...filters, severity: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
              style={{
                backgroundColor: "var(--bg-hover)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filters.assignedTo}
              onChange={(e) => {
                setFilters({ ...filters, assignedTo: e.target.value });
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50 transition-all"
              style={{
                backgroundColor: "var(--bg-hover)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <option value="">All Developers</option>
              <option value="Anandteertha">Anandteertha</option>
              <option value="Advait">Advait</option>
              <option value="Adit">Adit</option>
              <option value="Kavya">Kavya</option>
            </select>
          </div>
        </div>

        {/* Bugs List */}
        {isLoading ? (
          <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
            <LoadingSpinner message="Loading bug reports..." size="md" />
          </div>
        ) : error ? (
          <div className="rounded-2xl p-6 border text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[var(--error)]" />
            <p className="text-[var(--text)] font-medium mb-2">Error Loading Bugs</p>
            <p className="text-[var(--text-subtle)] text-sm">{error}</p>
            <button
              onClick={loadBugs}
              className="mt-4 px-4 py-2 rounded-lg bg-[var(--orange)] text-[var(--bg)] hover:bg-[var(--cream)] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="rounded-2xl p-12 border text-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}>
            <Bug className="h-16 w-16 mx-auto mb-4 text-[var(--text-subtle)]" />
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">No Bugs Found</h3>
            <p className="text-[var(--text-subtle)]">
              {searchQuery || Object.values(filters).some(f => f) 
                ? "No bugs match your filters. Try adjusting your search or filters."
                : "No bug reports yet. Great job!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBugs.map((bug, idx) => {
              const StatusIcon = STATUS_ICONS[bug.status] || AlertCircle;
              return (
                <motion.div
                  key={bug._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl p-6 border"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-card)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[var(--text)]">
                          {bug.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${SEVERITY_COLORS[bug.severity]}`}
                        >
                          {bug.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[bug.status]}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {bug.status.replace("-", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-subtle)] mb-3 line-clamp-2">
                        {bug.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Reported By</p>
                      <p className="text-sm text-[var(--text)] font-medium">
                        {bug.reportedByName || "Anonymous"}
                      </p>
                      {bug.reportedByEmail && (
                        <p className="text-xs text-[var(--text-subtle)]">
                          {bug.reportedByEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Assigned To</p>
                      <p className="text-sm text-[var(--text)] font-medium">
                        {bug.assignedTo || "Unassigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Reported On</p>
                      <p className="text-sm text-[var(--text)]">
                        {formatDate(bug.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-subtle)] mb-1">Last Updated</p>
                      <p className="text-sm text-[var(--text)]">
                        {formatDate(bug.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(bug.stepsToReproduce || bug.expectedBehavior || bug.actualBehavior) && (
                    <div className="pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                      {bug.stepsToReproduce && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-subtle)] mb-1">Steps to Reproduce:</p>
                          <p className="text-sm text-[var(--text)] whitespace-pre-line">
                            {bug.stepsToReproduce}
                          </p>
                        </div>
                      )}
                      {bug.expectedBehavior && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-subtle)] mb-1">Expected:</p>
                          <p className="text-sm text-[var(--text)]">{bug.expectedBehavior}</p>
                        </div>
                      )}
                      {bug.actualBehavior && (
                        <div>
                          <p className="text-xs font-medium text-[var(--text-subtle)] mb-1">Actual:</p>
                          <p className="text-sm text-[var(--text)]">{bug.actualBehavior}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              Previous
            </button>
            <span className="text-sm text-[var(--text-subtle)] px-4">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                borderColor: "var(--border)",
                color: "var(--text)",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

