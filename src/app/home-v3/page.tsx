import type { Metadata } from "next";
import ScrollStoryHomePage from "@/components/home-v3/ScrollStoryHomePage";

export const metadata: Metadata = {
  title: "Ty Malabar - Authentic Indian Cuisine (Preview)",
  description: "Experience the best Indian food in town. Fresh, authentic Kerala dishes delivered to your doorstep.",
};

export default function HomeV3Page() {
  return <ScrollStoryHomePage />;
}
