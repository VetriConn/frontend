import { redirect } from "next/navigation";

export default function AdminJobsIndex() {
  redirect("/admin/jobs/pending");
}
