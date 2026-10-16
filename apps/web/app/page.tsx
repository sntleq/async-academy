import { redirect } from "next/navigation";

export const metadata = {
  title: "Async Academy",
};

export default function Page() {
  redirect("/javascript");
}
