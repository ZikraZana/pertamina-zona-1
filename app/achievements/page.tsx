import ContentAchievements from "@/components/Achievements/ContentAchievement";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Achievements',
};

export default function Achievements() {
    return (
        <div>
            <ContentAchievements />
        </div>
    );
}