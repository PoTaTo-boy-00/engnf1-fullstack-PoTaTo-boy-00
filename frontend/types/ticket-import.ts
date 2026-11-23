
export interface ImportTicket {
  externalId: string;
  subject: string;
  body: string;
}

export interface ImportTicketsInput {
  tickets: ImportTicket[];
}

export interface ImportTicketsResult {
  importedCount: number;
  updatedCount: number;
  skippedOverrideCount: number;
  total: number;
}
