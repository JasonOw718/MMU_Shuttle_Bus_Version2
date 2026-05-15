import { Pin, Megaphone, Info, Bus } from "lucide-react";
import type { AnnouncementCardProps } from "../interfaces/props/AnnouncementProps";
import ViewFileButton from "./ViewFileButton";
import { viewImage } from "../services/fileService";
import { format, parseISO } from 'date-fns';

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
    const isPinned = announcement.isPinned;

    const onView = async () => {
        const fileName = String(announcement.fileName);
        if (!fileName) return;
        await viewImage(fileName);
    }

    const formattedDate = format(parseISO(String(announcement.createdAt)), "MMM d, yyyy 'at' h:mm a");

    return (
        <div className={`rounded-xl border shadow-sm p-6 md:p-8 mb-4 border-l-[6px] ${isPinned
            ? "bg-[#fef8ea] border-r-amber-100 border-y-amber-100 border-l-[#f59e0b]"
            : "bg-white border-r-gray-100 border-y-gray-100 border-l-[#3b82f6]"
            }`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {isPinned ? (
                        <Pin className="w-5 h-5 md:w-[22px] md:h-[22px] text-[#f59e0b]" fill="currentColor" />
                    ) : (
                        <Info className="w-5 h-5 md:w-[22px] md:h-[22px] text-[#3b82f6]" />
                    )}
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                        {announcement.title}
                    </h3>
                </div>

                {isPinned && (
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#fbbf24] text-white text-[11px] md:text-xs font-bold rounded-full tracking-wide">
                            Pinned
                        </span>
                        <Megaphone className="w-5 h-5 text-[#f59e0b]" strokeWidth={2.5} />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                    {announcement.description}
                </p>
                {announcement.fileName && (
                    <ViewFileButton fileName={announcement.fileName} onView={onView} />
                )}
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 font-medium">
                    {announcement.busPlate && (
                        <>
                            <Bus className="w-3.5 h-3.5" />
                            <span>{announcement.busPlate}</span>
                            <span className="text-gray-300">·</span>
                        </>
                    )}
                    <span className="whitespace-pre-wrap">{formattedDate}</span>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementCard;