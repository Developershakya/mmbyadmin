import React, { useState, useEffect } from 'react';
import {
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  ShieldAlert,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export default function ServiceAuditLogModal({
  isOpen,
  onClose
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = serviceFilter === 'ALL' ? '/api/travel/logs' : `/api/travel/logs?serviceType=${serviceFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, serviceFilter]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.endpoint?.toLowerCase().includes(q) ||
      l.traceId?.toLowerCase().includes(q) ||
      l.serviceType?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              <span>Service API Audit & Security Logs</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {logs.length} Entries
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sanitized API traces, latency monitoring, and request/response integrity records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 py-3 items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'FLIGHT', 'HOTEL', 'BUS', 'CAR', 'PAYMENT'].map((t) => (
              <button
                key={t}
                onClick={() => setServiceFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  serviceFilter === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search trace ID or endpoint..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
              <p className="text-xs">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-sm font-semibold text-slate-600">No logs recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Logs are automatically written during searches, bookings, and payments</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedId === log.id;
              const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
              return (
                <div
                  key={log.id}
                  className="border border-slate-200 rounded-xl bg-white overflow-hidden text-xs transition-all"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSuccess ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="font-mono font-bold text-slate-800 uppercase px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                        {log.serviceType}
                      </span>
                      <span className="font-mono text-slate-700 font-semibold">{log.endpoint}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {log.statusCode || 200}
                      </span>
                      <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {log.latencyMs}ms
                      </span>
                      <span className="font-mono text-slate-400 text-[10px] hidden md:inline">
                        {log.traceId}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 font-mono text-[11px]">
                      <div>
                        <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">
                          Sanitized Request Payload
                        </div>
                        <pre className="p-2.5 bg-white border border-slate-200 rounded-lg overflow-x-auto text-slate-700 max-h-40">
                          {typeof log.requestPayload === 'string'
                            ? log.requestPayload
                            : JSON.stringify(log.requestPayload, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">
                          Sanitized Response Payload
                        </div>
                        <pre className="p-2.5 bg-white border border-slate-200 rounded-lg overflow-x-auto text-slate-700 max-h-48">
                          {typeof log.responsePayload === 'string'
                            ? log.responsePayload
                            : JSON.stringify(log.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
