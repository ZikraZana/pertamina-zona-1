import ContentBlog from "@/components/Blog/ContentBlog";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Blog',
};

export default function Blog(){
    return(
        <div>
            <ContentBlog />
        </div>
    );
}