import { ArrowDown, ArrowRight, Database, Layers3, Monitor, Server } from "lucide-react";
import { styles } from "./class-names";

const layers = [
  { icon: Monitor, name: "Next.js", role: "Ticket, resource & admin workspace" },
  { icon: Server, name: "Express API", role: "Authentication, validation & services" },
  { icon: Layers3, name: "Prisma ORM", role: "Typed database access" },
  { icon: Database, name: "PostgreSQL", role: "Tickets, bookings & audit events" },
];

export function AboutSection() {
  return (
    <section className={styles.about} id="about" aria-labelledby="about-title">
      <div className={`${styles.container} ${styles.aboutGrid}`}>
        <div className={styles.aboutCopy} data-motion="reveal">
          <p className={styles.sectionKicker}>About TriageSync</p>
          <h2 id="about-title">A shared home for support operations.</h2>
          <p className={styles.aboutLead}>
            TriageSync is a full-stack project for support teams that need to classify
            incoming tickets, record human decisions, and coordinate shared resources.
          </p>
          <p className={styles.aboutBody}>
            The frontend talks to an Express API. Prisma connects the API to PostgreSQL,
            where ticket updates, booking requests, and ticket history are stored.
          </p>
          <div className={styles.stackList}>
            <span>TECHNOLOGY STACK</span>
            <div><b>Next.js</b><b>React</b><b>TypeScript</b><b>Tailwind CSS</b><b>TanStack Query</b><b>Express</b><b>Prisma</b><b>PostgreSQL</b><b>JWT</b><b>Zod</b></div>
          </div>
        </div>
        <div className={styles.architecture} data-motion="reveal" aria-label="TriageSync architecture">
          <div className={styles.architectureTop}><span>REQUEST PATH</span><span>01 — 04</span></div>
          <div className={styles.architectureFlow}>
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              return <div className={styles.architectureStep} key={layer.name}>
                <div className={styles.architectureNode}><span className={styles.archIcon}><Icon size={17} /></span><span><strong>{layer.name}</strong><small>{layer.role}</small></span><span className={styles.archIndex}>0{index + 1}</span></div>
                {index < layers.length - 1 && <div className={styles.architectureConnector}><span /><ArrowDown size={13} /></div>}
              </div>;
            })}
          </div>
          <div className={styles.architectureFoot}><span className={styles.archPulse} /> Authenticated API requests · validated input · persistent records</div>
          <ArrowRight className={styles.archCorner} size={18} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
