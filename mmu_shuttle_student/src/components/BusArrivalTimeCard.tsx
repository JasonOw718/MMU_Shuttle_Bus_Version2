import type { BusArrivalTimeCardProps } from "../interfaces/props/BusArrivalTimeCardProps";
import { Radio } from "lucide-react";

const BusArrivalTimeCard = ({ time, isLiveEta = false, arrivals = [] }: BusArrivalTimeCardProps) => {
    const liveArrivals = arrivals;
    const hasArrivingSoon = liveArrivals.some((arrival) => {
        const etaMinute = Number.parseInt(arrival.time, 10);
        return !Number.isNaN(etaMinute) && etaMinute <= 1;
    });
    const cardBorderColor = hasArrivingSoon ? "border-emerald-200" : "border-slate-200";
    const cardBackgroundColor = hasArrivingSoon ? "bg-emerald-50/40" : "bg-slate-50";

    if (isLiveEta) {
        return (
            <div className={`w-full max-w-full rounded-[16px] border ${cardBorderColor} ${cardBackgroundColor} p-3 sm:p-5 mb-6 shadow-sm`}>
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                    <span className="text-[14px] sm:text-[17px] font-bold text-slate-900">
                        Upcoming arrivals
                    </span>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3">
                    {liveArrivals.map((arrival) => {
                        const etaMinute = Number.parseInt(arrival.time, 10);
                        const isArrivingSoon = !Number.isNaN(etaMinute) && etaMinute <= 1;
                        const etaTextColor = isArrivingSoon ? "text-emerald-600" : "text-amber-500";
                        const etaBadgeColor = isArrivingSoon ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700";

                        return (
                            <div key={arrival.busPlate} className="flex items-center justify-between gap-2 py-2 min-w-0">
                                <span className={`px-3 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold whitespace-nowrap ${etaBadgeColor}`}>
                                    {arrival.busPlate}
                                </span>

                                <div className="flex flex-col items-end shrink-0">
                                    <div className={`flex items-center gap-1 text-[18px] sm:text-[20px] font-bold leading-none whitespace-nowrap ${etaTextColor}`}>
                                        <Radio className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                                        <span className="tabular-nums animate-pulse">{arrival.time}</span>
                                    </div>
                                    {isArrivingSoon && (
                                        <span className="text-[10px] sm:text-[12px] font-semibold text-emerald-700 mt-1 text-right leading-tight">
                                            Arriving soon
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fef0cb] rounded-[16px] p-4 md:p-5 w-[94%] max-w-[320px] flex flex-col justify-center mb-6">
            <span className="text-[13px] md:text-[14px] font-medium text-slate-600 mb-0.5">
                Next Bus
            </span>
            <span className="text-[22px] md:text-[24px] font-bold text-slate-900 tracking-tight">
                {time}
            </span>
            <span className="text-[11px] text-amber-700 mt-2 leading-snug">
                ⚠️ Time is clock-based, bus may be delayed or already passed. Check the map for live location.
            </span>
        </div>
    );
};

export default BusArrivalTimeCard;