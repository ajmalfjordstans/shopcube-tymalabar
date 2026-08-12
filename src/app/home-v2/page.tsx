import type { Metadata } from "next";
import AnimatedHomePage from "@/components/home-v2/AnimatedHomePage";

export const metadata: Metadata = {
  title: "Ty Malabar - Authentic Indian Cuisine (Preview)",
  description: "Experience the best Indian food in town. Fresh, authentic Kerala dishes delivered to your doorstep.",
};

export default function HomeV2Page() {
  return <AnimatedHomePage />;
}
