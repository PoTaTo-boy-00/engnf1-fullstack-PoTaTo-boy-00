import { ArrowUpRight, Database, FileClock, LockKeyhole, Repeat2 } from "lucide-react";
import { styles } from "./class-names";

const highlights = [
  { icon: Database, number: "01", title: "PostgreSQL transactions", body: "Ticket imports run in a transaction. Booking checks and inserts are committed together." },
  { icon: LockKeyhole, number: "02", title: "Row-level booking locks", body: "The booking service locks the resource row before checking active overlaps and creating a request." },
  { icon: Repeat2, number: "03", title: "Human choices survive feed updates", body: "Tickets are matched by unique external ID. Re-imports keep human category and priority overrides." },
  { icon: FileClock, number: "04", title: "A history of ticket changes", body: "Category, priority, status, and assignee edits are recorded with the actor and old and new values." },
];

export function EngineeringHighlights() {
  return (
    <section className={styles.engineering} id="engineering" aria-labelledby="engineering-title">
      <div className={styles.container}>
        <div className={styles.engineeringHead} data-motion="reveal">
          <div><p className={styles.sectionKicker}>Engineering highlights</p><h2 id="engineering-title">Decisions protected by the system.</h2></div>
          <p>Core workflows are backed by database constraints, transaction boundaries, and a traceable record of changes.</p>
        </div>
        <div className={styles.highlightGrid}>
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return <article className={styles.highlight} key={item.number} data-motion="reveal">
              <div className={styles.highlightTop}><span className={styles.highlightIcon}><Icon size={17} /></span><span>{item.number} <ArrowUpRight size={13} /></span></div>
              <h3>{item.title}</h3><p>{item.body}</p><span className={styles.highlightRule} style={{ "--line-index": index } as React.CSSProperties} />
            </article>;
          })}
        </div>
        <div className={styles.engineeringNote} data-motion="reveal"><span>IMPLEMENTATION</span><p>Booking transactions combine resource and user locks with a PostgreSQL exclusion constraint for overlapping active slots.</p><a href="https://github.com/PoTaTo-boy-00/engnf1-fullstack-PoTaTo-boy-00" target="_blank" rel="noreferrer">View the source <ArrowUpRight size={13} /></a></div>
      </div>
    </section>
  );
}
