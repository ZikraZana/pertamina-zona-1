import ContentOverview from "@/components/Overview/ContentOverview";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Overview',
};

export default function Overview(){
    return(
        <div>
            <ContentOverview />
        </div>
    );
}