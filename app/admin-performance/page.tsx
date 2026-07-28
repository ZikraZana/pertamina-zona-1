import AdminPerformanceContent from "@/components/AdminPerformance/AdminPerformanceContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Admin',
};

export default function AdminPerformance(){
    return(
        <div>
            <AdminPerformanceContent/>
        </div>
    );
}