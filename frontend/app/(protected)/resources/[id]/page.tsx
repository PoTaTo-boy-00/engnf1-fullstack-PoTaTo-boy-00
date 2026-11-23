
import { Suspense } from "react";
import ResourceDetailClient from "./resource-detail-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function ResourceContent({ params }: PageProps) {
  const { id } = await params;

  return <ResourceDetailClient id={id} />;
}

export default function ResourceDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          Loading resource...
        </main>
      }
    >
      <ResourceContent params={params} />
    </Suspense>
  );
}
