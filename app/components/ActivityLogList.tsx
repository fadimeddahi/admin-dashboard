"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X } from "lucide-react";
import ActivityLogItem from "./ActivityLogItem";
import { authenticatedFetch, API_BASE_URL } from "@/lib/auth";
import type { ActivityLog } from "@/app/types/logs";

interface ActivityLogListProps {
  limit?: number;
}

export default function ActivityLogList({ limit }: ActivityLogListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const pageSize = 15;

  const {
    data: logsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activityLogs"],
    queryFn: async () => {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/logs`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch logs (${response.status}). Backend endpoint may not be implemented yet. ` +
          `Please ensure the backend has a GET ${API_BASE_URL}/logs endpoint.`
        );
      }
      const json = await response.json();
      // Handle both array and paginated response
      return Array.isArray(json) ? json : json.logs || json.data || [];
    },
    staleTime: 30000, // 30 seconds
    retry: 1, // Only retry once on failure
  });

  // Filter logs
  const filteredLogs = useMemo(() => {
    const currentLogs = logsData || [];
    return currentLogs.filter((log: ActivityLog) => {
      const matchesSearch =
        !searchQuery ||
        log.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin_id?.toString().includes(searchQuery);

      const matchesAction =
        !actionFilter || log.action.toLowerCase() === actionFilter.toLowerCase();

      const matchesEntity =
        !entityFilter ||
        log.entity_type.toLowerCase() === entityFilter.toLowerCase();

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logsData, searchQuery, actionFilter, entityFilter]);

  // Paginate
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedLogs = filteredLogs.slice(startIdx, endIdx);

  const displayLogs = limit ? paginatedLogs.slice(0, limit) : paginatedLogs;
  const showPagination = !limit && filteredLogs.length > pageSize;

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-400 space-y-3">
        <div>
          <p className="font-semibold">Error loading activity logs</p>
          <p className="text-sm text-red-300 mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
        <div className="text-xs text-red-300 bg-black/30 p-3 rounded font-mono">
          <p className="font-semibold mb-1">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure backend has a <code>/logs</code> or <code>/activity-logs</code> endpoint</li>
            <li>Verify the endpoint returns an array or object with logs/data properties</li>
            <li>Check network tab in browser DevTools for exact error</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {!limit && (
        <div className="space-y-3 bg-zinc-800 rounded-lg border border-zinc-700 p-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by entity name, details, or admin ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Action & Entity Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="confirm">Confirm</option>
                <option value="ship">Ship</option>
                <option value="cancel">Cancel</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="export">Export</option>
                <option value="import">Import</option>
              </select>
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">All Entity Types</option>
                <option value="product">Product</option>
                <option value="order">Order</option>
                <option value="category">Category</option>
                <option value="admin">Admin</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || actionFilter || entityFilter) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActionFilter("");
                  setEntityFilter("");
                  setPage(1);
                }}
                className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-sm text-gray-300 hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* Result Count */}
          <p className="text-xs text-gray-400">
            {filteredLogs.length} log{filteredLogs.length !== 1 ? "s" : ""} found
            {limit && ` (showing first ${limit})`}
          </p>
        </div>
      )}

      {/* Logs List */}
      <div className="space-y-3">
        {isLoading ? (
          <>
            {Array.from({ length: pageSize }).map((_, i) => (
              <ActivityLogItem key={`skeleton-${i}`} log={{} as ActivityLog} isLoading />
            ))}
          </>
        ) : displayLogs.length === 0 ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-8 text-center text-gray-400">
            <p className="font-semibold mb-1">No activity logs found</p>
            <p className="text-sm">
              {filteredLogs.length === 0 && (searchQuery || actionFilter || entityFilter)
                ? "Try adjusting your filters"
                : "Activity logs will appear here"}
            </p>
          </div>
        ) : (
          displayLogs.map((log: ActivityLog) => (
            <ActivityLogItem key={log.id} log={log} />
          ))
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages} ({filteredLogs.length} total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-gray-300 hover:text-white hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-zinc-700 border border-zinc-600 rounded text-sm text-gray-300 hover:text-white hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
