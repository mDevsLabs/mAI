import { redirect } from "next/navigation";

export default function ApiPage() {
  redirect("/account/keys");
}
