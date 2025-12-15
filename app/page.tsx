import RecommendationRow from "@/components/RecommendationRow";
import LocalSection from "@/components/LocalSection";

export default function HomePage() {
  return (
    <div className="p-6 space-y-10">
      <RecommendationRow
        title="Recommended for You"
        keyword="pop"
      />

      <RecommendationRow
        title="Indie Picks"
        keyword="indie"
      />

      <RecommendationRow
        title="Rock Classics"
        keyword="rock"
      />

      <LocalSection />
    </div>
  );
}
