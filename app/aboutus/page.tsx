import ContentAboutUs from "@/components/AboutUs/ContentAboutUs";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'About Us',
};

export default function AboutUs() {
    return (
        <div>
            <ContentAboutUs />
        </div>
    );
}