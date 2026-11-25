import type { Metadata } from "next";
import { AboutSection } from "@/components/marketing/about-section";
import { EngineeringHighlights } from "@/components/marketing/engineering-highlights";
import { MotionFrame } from "@/components/marketing/motion-frame";
import { ProductPreview } from "@/components/marketing/product-preview";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import "@/components/marketing/marketing.css";
import { styles } from "@/components/marketing/class-names";

export const metadata: Metadata = {
  title: "TriageSync — Support operations workspace",
  description: "TriageSync brings support ticket triage, human review, shared resource booking, and team oversight into one workspace.",
};

export default function Home() {
  return (
    <MotionFrame>
      <div className={styles.site} id="top">
        <SiteHeader />
        <main>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={`${styles.container} ${styles.heroInner}`}>
              <div className={styles.heroCopy} data-motion="hero">
                <p className={styles.eyebrow}>
                  <span className={styles.eyebrowDot} /> Support operations, in sync
                </p>
                <h1 id="hero-title">
                  Support work,<br />
                  <span>with a clear next step.</span>
                </h1>
                <p className={styles.heroLead}>
                  TriageSync brings ticket review, resource booking, and team
                  oversight into one focused workspace.
                </p>
                <div className={styles.heroActions}>
                  <a className={styles.primaryLink} href="/register">
                    Create an account <span aria-hidden="true">↗</span>
                  </a>
                  <a className={styles.textLink} href="#product">
                    See the product <span aria-hidden="true">↓</span>
                  </a>
                </div>
                <div className={styles.heroNote}>
                  <span className={styles.noteRule} />
                  <span>Tickets, bookings, and decisions in one workspace</span>
                </div>
              </div>

              <ProductPreview />
            </div>
            <div className={styles.heroFoot}>
              <span>BUILT FOR THE WORK BETWEEN REQUEST AND RESOLUTION</span>
              <span className={styles.heroFootLine} />
              <span>TRIAGESYNC · SUPPORT OPERATIONS</span>
            </div>
          </section>

          <section className={styles.workflow} id="product" aria-labelledby="workflow-title">
            <div className={styles.container}>
              <div className={styles.sectionIntro} data-motion="reveal">
                <p className={styles.sectionKicker}>One connected workspace</p>
                <h2 id="workflow-title">From incoming ticket to a decision the team can follow.</h2>
                <p>
                  Keep the ticket, its human review, and the work around it connected
                  from the first update onward.
                </p>
              </div>
              <div className={styles.flowLine} data-motion="reveal" aria-label="Ticket workflow">
                <div className={styles.flowStep}>
                  <span className={styles.flowNumber}>01</span>
                  <span className={styles.flowGlyph}>↘</span>
                  <h3>Receive</h3>
                  <p>Bring incoming support records into the ticket queue.</p>
                </div>
                <div className={styles.flowStep}>
                  <span className={styles.flowNumber}>02</span>
                  <span className={styles.flowGlyph}>⌁</span>
                  <h3>Triage</h3>
                  <p>Review the suggested category and priority, then decide.</p>
                </div>
                <div className={styles.flowStep}>
                  <span className={styles.flowNumber}>03</span>
                  <span className={styles.flowGlyph}>▦</span>
                  <h3>Coordinate</h3>
                  <p>Connect support work with shared resource bookings.</p>
                </div>
                <div className={styles.flowStep}>
                  <span className={styles.flowNumber}>04</span>
                  <span className={styles.flowGlyph}>↗</span>
                  <h3>Understand</h3>
                  <p>Give administrators a view across tickets and bookings.</p>
                </div>
              </div>
            </div>
          </section>

          <AboutSection />
          <EngineeringHighlights />

          <section className={styles.ctaSection} aria-labelledby="cta-title" data-motion="reveal">
            <div className={`${styles.container} ${styles.ctaInner}`}>
              <div>
                <p className={styles.sectionKicker}>A clearer working day</p>
                <h2 id="cta-title">Bring the moving parts together.</h2>
                <p>Sign in to your workspace or create an account to get started.</p>
              </div>
              <div className={styles.ctaActions}>
                <a className={styles.primaryLink} href="/register">Create an account <span aria-hidden="true">↗</span></a>
                <a className={styles.ctaLogin} href="/login">Sign in to TriageSync <span aria-hidden="true">→</span></a>
              </div>
              <div className={styles.ctaOrbit} aria-hidden="true"><span /><span /><span /></div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </MotionFrame>
  );
}
