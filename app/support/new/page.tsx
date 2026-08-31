import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import NewTicketClient from "./NewTicketClient";

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      }
    >
      <NewTicketClient />
    </Suspense>
  );
}
