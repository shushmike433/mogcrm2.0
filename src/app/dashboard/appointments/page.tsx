import ClientCollectionTable from "@/components/dashboard/ClientCollectionTable";

export default function AppointmentsPage() {
  return <ClientCollectionTable
    title="Appointments"
    description="Keep upcoming bookings and customer visits organized."
    collectionName="appointments"
  />;
}
