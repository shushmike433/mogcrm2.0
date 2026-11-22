import ClientCollectionTable from "@/components/dashboard/ClientCollectionTable";

export default function LeadsPage() {
  return <ClientCollectionTable
    title="Leads"
    description="Review customer opportunities connected to your workspace."
    collectionName="leads"
  />;
}
