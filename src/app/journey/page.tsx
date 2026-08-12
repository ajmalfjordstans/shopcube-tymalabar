import type { Metadata } from "next";
import BiryaniJourney from "@/components/journey/BiryaniJourney";

export const metadata: Metadata = {
  title: "The Journey of Biriyani | Ty Malabar",
  description: "A scroll-driven journey from the Malabar Coast to your table.",
};

export default function JourneyPage() {
  return <BiryaniJourney />;
}
