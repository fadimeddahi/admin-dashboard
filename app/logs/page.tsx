"use client";

import React from "react";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ActivityLogList from "../components/ActivityLogList";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          </div>
          <p className="text-gray-400">
            Complete audit trail of all admin activities, product changes, and order actions
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Logs List */}
      <ActivityLogList />
    </div>
  );
}
