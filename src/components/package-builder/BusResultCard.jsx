import React, { useState } from "react";
import {
  Bus,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Users,
  IdCard,
  Wifi,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");

export default function BusResultCard({ bus, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("BOARDING"); // BOARDING | CANCELLATION | INFO

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-md transition duration-150">
      {/* Main Summary Row */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[180px]">
          <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5" />
          </span>
          <div>
            <h4 className="font-bold text-sm text-[#0F172A]">{bus.operator}</h4>
            <p className="text-xs text-slate-500">{bus.busType}</p>
            {bus.busRoute && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                {bus.busRoute}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-center">
          <div className="text-right">
            <span className="text-base font-bold text-[#0F172A] block leading-none">
              {bus.departure}
            </span>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <Clock className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span className="text-[11px] text-slate-500 font-medium">
              {bus.duration}
            </span>
            {bus.isArrivingNextDay && (
              <span className="text-[9px] text-amber-600 font-bold mt-0.5">
                Next Day
              </span>
            )}
          </div>
          <div className="text-left">
            <span className="text-base font-bold text-[#0F172A] block leading-none">
              {bus.arrival}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-center">
          <div className="text-right">
            <div className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
              {inr(bus.price)}
              <span className="text-[11px] font-normal text-slate-500 block">
                per seat
              </span>
            </div>
            {bus.seatsLeft !== "" && Number(bus.seatsLeft) <= 10 && (
              <span className="text-[10px] font-semibold text-amber-600 block mt-0.5">
                {bus.seatsLeft} seats left
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSelect(bus)}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition duration-150 cursor-pointer shrink-0"
          >
            Select
          </button>
        </div>
      </div>

      {/* Badges + View Details toggle */}
      <div className="px-4 sm:px-5 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {bus.isAC && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              AC
            </span>
          )}
          {bus.isSleeper && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sleeper
            </span>
          )}
          {bus.isSeater && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Seater
            </span>
          )}
          {bus.liveTracking && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Tracking
            </span>
          )}
          {bus.mTicketEnabled && (
            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              M-Ticket
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Max {bus.maxSeatsPerTicket} seats/ticket
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-slate-600 hover:text-amber-600 font-semibold cursor-pointer flex items-center gap-1"
        >
          <span>{expanded ? "Hide Details" : "View Details"}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Detail Panel */}
      {expanded && (
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 space-y-4 animate-in fade-in duration-150">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("BOARDING")}
              className={`pb-2 transition cursor-pointer border-b-2 ${
                activeTab === "BOARDING"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              BOARDING &amp; DROPPING
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CANCELLATION")}
              className={`pb-2 transition cursor-pointer border-b-2 ${
                activeTab === "CANCELLATION"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              CANCELLATION POLICY
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("INFO")}
              className={`pb-2 transition cursor-pointer border-b-2 ${
                activeTab === "INFO"
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              BUS INFO
            </button>
          </div>

          {/* TAB: BOARDING & DROPPING */}
          {activeTab === "BOARDING" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                <h5 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2.5">
                  <MapPin className="w-3.5 h-3.5" /> Boarding Points
                </h5>
                <div className="space-y-2.5">
                  {(bus.boardingPoints || []).length === 0 ? (
                    <p className="text-[11px] text-slate-400">
                      No boarding points listed.
                    </p>
                  ) : (
                    (bus.boardingPoints || []).map((bp) => (
                      <div
                        key={bp.id}
                        className="text-xs border-l-2 border-emerald-300 pl-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {bp.name}
                          </span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            {bp.time}
                          </span>
                        </div>
                        {bp.landmark && (
                          <p className="text-[11px] text-slate-500">
                            {bp.landmark}
                          </p>
                        )}
                        {bp.isPrime && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                            Prime Point
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                <h5 className="text-xs font-bold text-rose-700 flex items-center gap-1.5 mb-2.5">
                  <MapPin className="w-3.5 h-3.5" /> Dropping Points
                </h5>
                <div className="space-y-2.5">
                  {(bus.droppingPoints || []).length === 0 ? (
                    <p className="text-[11px] text-slate-400">
                      No dropping points listed.
                    </p>
                  ) : (
                    (bus.droppingPoints || []).map((dp) => (
                      <div
                        key={dp.id}
                        className="text-xs border-l-2 border-rose-300 pl-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            {dp.name}
                          </span>
                          <span className="font-mono text-rose-700 font-semibold">
                            {dp.time}
                          </span>
                        </div>
                        {dp.landmark && (
                          <p className="text-[11px] text-slate-500">
                            {dp.landmark}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CANCELLATION POLICY */}
          {activeTab === "CANCELLATION" && (
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs mb-1">
                {bus.partialCancellationAllowed ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Partial
                    Cancellation Allowed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Partial Cancellation Not
                    Allowed
                  </span>
                )}
              </div>
              {(bus.cancellationPolicies || []).length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  No cancellation policy provided.
                </p>
              ) : (
                (bus.cancellationPolicies || []).map((cp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs p-2 bg-amber-50/60 rounded-lg border border-amber-100"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900">
                        {cp.charge || "N/A"}
                        {cp.charge ? "%" : ""} charge
                      </span>
                      {cp.policyString && (
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {cp.policyString}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: BUS INFO */}
          {activeTab === "INFO" && (
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Max {bus.maxSeatsPerTicket} seats/ticket</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  ID Proof: {bus.idProofRequired ? "Required" : "Not Required"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Drop Point:{" "}
                  {bus.isDropPointMandatory ? "Mandatory" : "Optional"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                <span>Live Tracking: {bus.liveTracking ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  M-Ticket: {bus.mTicketEnabled ? "Enabled" : "Not Available"}
                </span>
              </div>
              {bus.routeId && (
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <span className="text-slate-400">Route ID:</span>
                  <span className="font-mono text-[10px] text-slate-600">
                    {bus.routeId}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
