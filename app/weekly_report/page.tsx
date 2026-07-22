import WeeklyReportContent from "@/components/WeeklyReport/WeeklyReportContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Weekly Report',
};

export default function Overview() {
    return (
        <div>
            <WeeklyReportContent />
        </div>
    );
}