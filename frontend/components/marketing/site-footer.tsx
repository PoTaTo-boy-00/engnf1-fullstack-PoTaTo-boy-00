import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";
import { styles } from "./class-names";

const repositoryUrl = "https://github.com/PoTaTo-boy-00/engnf1-fullstack-PoTaTo-boy-00";

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.footerMain}`}>
      <div className={styles.footerBrandBlock}>
        <Link className={styles.brand} href="/" aria-label="TriageSync home"><span className={styles.brandMark} aria-hidden="true"><i /><i /><i /></span><span>Triage<span className={styles.brandLight}>Sync</span></span></Link>
        <p>Support tickets and shared resources, in one workspace.</p>
      </div>
      <div className={styles.footerCol}><span>WORKSPACE</span><Link href="/login">Log in <ArrowUpRight size={12} /></Link><Link href="/register">Create an account <ArrowUpRight size={12} /></Link><a href="#product">Product <ArrowUpRight size={12} /></a></div>
      <div className={styles.footerCol}><span>PROJECT</span><a href="#about">About TriageSync <ArrowUpRight size={12} /></a><a href="#engineering">Engineering <ArrowUpRight size={12} /></a><a href={repositoryUrl} target="_blank" rel="noreferrer"><GitBranch size={13} /> GitHub repository <ArrowUpRight size={12} /></a></div>
    </div>
    <div className={`${styles.container} ${styles.footerBottom}`}><span>© 2026 TriageSync</span><span>Support operations workspace</span><a href={repositoryUrl} target="_blank" rel="noreferrer">View source on GitHub <ArrowUpRight size={12} /></a></div>
  </footer>;
}
