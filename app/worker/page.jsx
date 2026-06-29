import { redirect } from "next/navigation";

export default function WorkerIndex() {
  redirect("/worker/dashboard");
}
