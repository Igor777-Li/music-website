import RecommendationRow from "@/components/RecommendationRow";
import LocalSection from "@/components/LocalSection";

export default function HomePage() {
  return (
    <div className="p-6 space-y-10">
      <RecommendationRow
        title="Recommended for You"
        source="search"
        keyword="pop"
      />

      <RecommendationRow
        title="Indie Picks"
        source="search"
        keyword="indie"
      />

      <RecommendationRow
        title="Rock Classics"
        source="search"
        keyword="rock"
      />


      <LocalSection />
    </div>
  );
}
