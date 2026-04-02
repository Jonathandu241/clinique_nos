import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";

export default function HomePage() {
  return (
    <main className="min-h-screen py-16">
      <Container className="space-y-8">
        <PageHeader
          eyebrow="Clinique NOS"
          title="Socle applicatif V1"
          description="Base technique initiale pour la gestion de rendez-vous des patients."
        />
        <div className="flex flex-wrap gap-3">
          <StatusPill label="Next.js App Router" />
          <StatusPill label="TypeScript" />
          <StatusPill label="Tailwind CSS" />
        </div>
      </Container>
    </main>
  );
}
