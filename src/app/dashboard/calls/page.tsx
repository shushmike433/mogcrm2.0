import ClientCollectionTable from "@/components/dashboard/ClientCollectionTable";

export default function CallsPage() {
  return <ClientCollectionTable
    title="Calls"
    description="Track call activity for your business."
    collectionName="calls"
  />;
}
