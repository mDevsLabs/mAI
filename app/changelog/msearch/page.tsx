import { getChangelogs } from "@/lib/changelog";
import ChangelogView from "../changelog-view";

export const metadata = {
  title: "mAI | Changelog mSearch",
  description: "Notes de version du projet mSearch.",
};

export default async function MsearchChangelogPage() {
  const changelogs = getChangelogs();

  return <ChangelogView changelogs={changelogs} filterProject="msearch" />;
}
