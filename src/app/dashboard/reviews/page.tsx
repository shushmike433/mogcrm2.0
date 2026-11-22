import ClientCollectionTable from "@/components/dashboard/ClientCollectionTable";

export default function ReviewsPage() {
  return <ClientCollectionTable
    title="Reviews"
    description="Monitor customer feedback and review activity."
    collectionName="reviews"
  />;
}
