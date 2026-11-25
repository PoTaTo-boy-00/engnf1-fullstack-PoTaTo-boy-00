"use client";

import { useState } from "react";
import { BarChart3, CalendarDays, Check, ChevronDown, Circle, Clock3, Inbox, LayoutDashboard, Search, SlidersHorizontal, TicketCheck, Users } from "lucide-react";
import { styles } from "./class-names";

const tabs = ["Ticket Triage", "Human Review", "Resource Booking", "Admin Analytics"] as const;
type PreviewTab = (typeof tabs)[number];

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>(tabs[0]);

  return (
    <div className={styles.previewWrap} data-motion="hero">
      <div className={styles.previewHalo} aria-hidden="true" />
      <div className={styles.previewShell}>
        <div className={styles.previewTopbar}>
          <div className={styles.previewBrand}><span className={styles.previewBrandMark}><i /><i /><i /></span><span>triagesync</span></div>
          <div className={styles.previewBreadcrumb}>Workspace <span>/</span> {activeTab}</div>
          <div className={styles.previewUser} aria-label="Workspace user">JD</div>
        </div>
        <div className={styles.previewTabs} role="tablist" aria-label="Product preview">
          {tabs.map((tab) => (
            <button
              className={`${styles.previewTab} ${activeTab === tab ? styles.previewTabActive : ""}`}
              key={tab}
              type="button"
              role="tab"
              id={`tab-${tab.toLowerCase().replaceAll(" ", "-")}`}
              aria-selected={activeTab === tab}
              aria-controls="product-panel"
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => setActiveTab(tab)}
            >{tab}</button>
          ))}
        </div>
        <div className={styles.previewPanel} id="product-panel" role="tabpanel" aria-labelledby={`tab-${activeTab.toLowerCase().replaceAll(" ", "-")}`}>
          {activeTab === "Ticket Triage" && <TicketTriage />}
          {activeTab === "Human Review" && <HumanReview />}
          {activeTab === "Resource Booking" && <ResourceBooking />}
          {activeTab === "Admin Analytics" && <AdminAnalytics />}
        </div>
        <div className={styles.previewBottom}><span><span className={styles.statusDot} /> Workspace ready</span><span>Ticket operations <span className={styles.bottomArrow}>↗</span></span></div>
      </div>
      <div className={`${styles.floatNote} ${styles.floatNoteTop}`}><span className={styles.floatIcon}><TicketCheck size={15} /></span><span><strong>Ticket updated</strong><small>Decision saved to history</small></span><Check size={14} className={styles.floatCheck} /></div>
      <div className={`${styles.floatNote} ${styles.floatNoteBottom}`}><span className={styles.floatAvatar}>AM</span><span><strong>Human review</strong><small>Category override protected</small></span></div>
    </div>
  );
}

function TicketTriage() {
  const tickets = [
    { id: "EXT-TEST-001", title: "Refund requested for duplicate invoice payment", category: "BILLING", priority: "HIGH", status: "OPEN", tone: "amber" },
    { id: "EXT-TEST-002", title: "Unable to login", category: "LOGIN", priority: "MEDIUM", status: "IN PROGRESS", tone: "blue" },
    { id: "EXT-TEST-003", title: "Package not arrived", category: "DELIVERY", priority: "LOW", status: "OPEN", tone: "green" },
  ];
  return <div className={styles.appView}>
    <aside className={styles.appRail} aria-label="Workspace sections"><span className={styles.railActive}><Inbox size={16} /></span><span><CalendarDays size={16} /></span><span><BarChart3 size={16} /></span><span className={styles.railBottom}><Users size={16} /></span></aside>
    <div className={styles.appMain}>
      <div className={styles.appHeading}><div><p className={styles.appOverline}>SUPPORT OPERATIONS</p><h3>Ticket queue</h3></div><span className={styles.appSmallButton}><SlidersHorizontal size={13} /> Filters</span></div>
      <div className={styles.searchBar}><Search size={14} /><span>Search tickets...</span><span className={styles.searchShortcut}>⌘ K</span></div>
      <div className={styles.tableHead}><span>SUBJECT</span><span>CATEGORY</span><span>PRIORITY</span><span>STATUS</span></div>
      <div className={styles.ticketRows}>{tickets.map((ticket) => <div className={styles.ticketRow} key={ticket.id}><div className={styles.ticketSubject}><span className={`${styles.ticketDot} ${styles[`dot_${ticket.tone}`]}`} /><span><strong>{ticket.title}</strong><small>{ticket.id}</small></span></div><span className={styles.categoryTag}>{ticket.category}</span><span className={`${styles.priority} ${styles[`priority_${ticket.tone}`]}`}>{ticket.priority}</span><span className={styles.statusPill}><Circle size={6} fill="currentColor" /> {ticket.status}</span></div>)}</div>
      <div className={styles.tableFooter}>Showing <strong>3</strong> tickets <span>Rows per page <b>10 <ChevronDown size={10} /></b></span></div>
    </div>
  </div>;
}

function HumanReview() {
  return <div className={styles.reviewView}>
    <div className={styles.reviewList}><div className={styles.reviewListHead}><span>OPEN TICKET</span><span className={styles.listCount}>3</span></div><div className={styles.reviewItemActive}><span className={`${styles.ticketDot} ${styles.dot_amber}`} /><span><strong>Duplicate invoice payment</strong><small>EXT-TEST-001 · 12 min ago</small></span></div><div className={styles.reviewItem}><span className={`${styles.ticketDot} ${styles.dot_blue}`} /><span><strong>Account access issue</strong><small>EXT-TEST-002 · 28 min ago</small></span></div><div className={styles.reviewItem}><span className={`${styles.ticketDot} ${styles.dot_green}`} /><span><strong>Delivery delay</strong><small>EXT-TEST-003 · 1 hr ago</small></span></div></div>
    <div className={styles.reviewDetail}><div className={styles.reviewDetailTop}><span className={styles.statusPill}><Circle size={6} fill="currentColor" /> OPEN</span><span>EXT-TEST-001</span></div><h3>Refund requested for duplicate invoice payment</h3><p>I was charged twice for the same invoice. Could you help review the duplicate payment?</p><div className={styles.reviewFields}><label>Category <span className={styles.fieldValue}>Billing <ChevronDown size={12} /></span></label><label>Priority <span className={styles.fieldValue}>High <ChevronDown size={12} /></span></label></div><div className={styles.reviewSaved}><span className={styles.savedCheck}><Check size={12} /></span><span><strong>Human decision saved</strong><small>Protected when the ticket feed updates</small></span></div></div>
  </div>;
}

function ResourceBooking() {
  return <div className={styles.bookingView}>
    <div className={styles.bookingHeading}><div><p className={styles.appOverline}>RESOURCE SCHEDULING</p><h3>Availability</h3></div><span className={styles.appSmallButton}><CalendarDays size={13} /> This week <ChevronDown size={11} /></span></div>
    <div className={styles.bookingDays}><span><small>MON</small><b>16</b></span><span><small>TUE</small><b>17</b></span><span className={styles.daySelected}><small>WED</small><b>18</b></span><span><small>THU</small><b>19</b></span><span><small>FRI</small><b>20</b></span></div>
    <div className={styles.bookingCalendar}><div className={styles.calendarRoom}><span className={styles.roomGlyph}>R</span><span><strong>Meeting room 2</strong><small>ROOM · CAPACITY 8</small></span><span className={styles.activeLabel}><i /> Available</span></div><div className={styles.timeSlots}><span>09:00</span><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><div className={styles.timeGrid}><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className={styles.bookingBlock}><strong>Ticket review</strong><small>10:00 – 11:00 · PENDING</small></div></div></div>
    <div className={styles.bookingHint}><Clock3 size={13} /><span>Bookings use half-open time ranges, so back-to-back slots remain available.</span></div>
  </div>;
}

function AdminAnalytics() {
  return <div className={styles.analyticsView}>
    <div className={styles.bookingHeading}><div><p className={styles.appOverline}>ADMIN WORKSPACE</p><h3>Overview</h3></div><span className={styles.appSmallButton}>All activity <ChevronDown size={11} /></span></div>
    <div className={styles.analyticsCards}><div><span>ACTIVE RESOURCES</span><strong><LayoutDashboard size={16} /> Resource inventory</strong><small>Availability and activation status</small></div><div><span>BOOKING REQUESTS</span><strong><CalendarDays size={16} /> By status</strong><small>Pending · Approved · Rejected · Cancelled</small></div><div><span>TICKET OVERVIEW</span><strong><Inbox size={16} /> Triage statistics</strong><small>Category · Priority · Status · Review</small></div></div>
    <div className={styles.analyticsBottom}><div className={styles.analyticsChart}><div><span>BOOKING ACTIVITY</span><span className={styles.chartPeriod}>By resource</span></div><div className={styles.chartBars} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className={styles.chartLabels}><span>Room</span><span>Lab</span><span>Equipment</span></div></div><div className={styles.analyticsSide}><span>BOOKING STATUS</span><p><i className={styles.legendPending} /> Pending</p><p><i className={styles.legendApproved} /> Approved</p><p><i className={styles.legendClosed} /> Rejected / Cancelled</p></div></div>
  </div>;
}
