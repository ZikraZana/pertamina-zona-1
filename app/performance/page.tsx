import PerformanceContent from "@/components/Performance/PerformanceContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Performance Report',
};

export default function Performance() {
    return (
        <div>
            <PerformanceContent />
        </div>
    );
}