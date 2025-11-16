import React from "react";
import { CheckCircle, Trash2, Plus, Edit, Activity } from "lucide-react";
import type { ActivityLog } from "../types/logs";

interface ActivityLogItemProps {
  log: ActivityLog;
  isLoading?: boolean;
}

const getActionIcon = (action: string) => {
  const iconClass = "w-4 h-4";
  
  if (action === "DELETE" || action === "CANCEL") {
    return <Trash2 className={`${iconClass} text-red-400`} />;
  }
  if (action === "CREATE") {
    return <Plus className={`${iconClass} text-green-400`} />;
  }
  if (action === "UPDATE") {
    return <Edit className={`${iconClass} text-blue-400`} />;
  }
  if (action === "CONFIRM" || action === "SHIP") {
    return <CheckCircle className={`${iconClass} text-emerald-400`} />;
  }
  return <Activity className={`${iconClass} text-gray-400`} />;
};

const getActionColor = (action: string) => {
  switch (action) {
    case "DELETE":
    case "CANCEL":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "CREATE":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "UPDATE":
    case "IMPORT":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "CONFIRM":
    case "SHIP":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

const getEntityColor = (entityType: string) => {
  switch (entityType) {
    case "product":
      return "bg-purple-500/10 text-purple-300";
    case "order":
      return "bg-blue-500/10 text-blue-300";
    case "admin":
      return "bg-amber-500/10 text-amber-300";
    default:
      return "bg-gray-500/10 text-gray-300";
  }
};

export default function ActivityLogItem({ log, isLoading }: ActivityLogItemProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-800 animate-pulse rounded-lg p-4 h-20" />
    );
  }

  const timestamp = new Date(log.created_at);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <div className={`border rounded-lg p-4 bg-zinc-800/50 border-zinc-700 hover:border-zinc-600 transition-colors ${getActionColor(log.action)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {getActionIcon(log.action)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">{log.action}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getEntityColor(log.entity_type)}`}>
                {log.entity_type}
              </span>
              {log.entity_name && (
                <span className="text-gray-300 text-sm truncate">
                  &quot;{log.entity_name}&quot;
                </span>
              )}
            </div>

            {log.details && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {log.details}
              </p>
            )}

            {(log.old_value || log.new_value) && (
              <div className="mt-2 text-xs bg-black/20 rounded p-2 font-mono space-y-1">
                {log.old_value && (
                  <div className="text-red-300">
                    <span className="text-gray-400">Old: </span>
                    <span className="line-clamp-1">{log.old_value}</span>
                  </div>
                )}
                {log.new_value && (
                  <div className="text-green-300">
                    <span className="text-gray-400">New: </span>
                    <span className="line-clamp-1">{log.new_value}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {log.username && (
            <p className="text-xs text-amber-300 font-medium whitespace-nowrap mb-1">
              @{log.username}
            </p>
          )}
          <p className="text-xs text-gray-400 whitespace-nowrap">{timeAgo}</p>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">ID: {log.id}</p>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}
