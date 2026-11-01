import { createFileRoute } from "@tanstack/react-router";
import { Stage } from "@/components/stage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Stage />;
}
