import Link from "next/link";
import { ArrowUpRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { styles } from "./class-names";

const repositoryUrl = "https://github.com/PoTaTo-boy-00/engnf1-fullstack-PoTaTo-boy-00";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link className={styles.brand} href="/" aria-label="TriageSync home">
          <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /></span>
          <span>Triage<span className={styles.brandLight}>Sync</span></span>
        </Link>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#about">About</a>
          <a href="#engineering">Engineering</a>
          <a className={styles.repoNav} href={repositoryUrl} target="_blank" rel="noreferrer">
            <GitBranch size={15} aria-hidden="true" /> GitHub <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.mobileRepoLink} href={repositoryUrl} target="_blank" rel="noreferrer" aria-label="TriageSync GitHub repository"><GitBranch size={16} aria-hidden="true" /></a>
          <Link className={styles.loginLink} href="/login">Log in</Link>
          <Button nativeButton={false} render={<Link href="/register" />} className={styles.headerButton}>
            Get started <ArrowUpRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
