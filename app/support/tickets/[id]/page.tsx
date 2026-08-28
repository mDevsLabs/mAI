import TicketDetailClient from "./TicketDetailClient";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailClient ticketId={id} />;
}
