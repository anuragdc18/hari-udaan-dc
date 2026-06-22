// reportService — FRONTEND-ONLY placeholder.
export const reportService = {
  async downloadExcel(_report: string): Promise<void> {
    // TODO: GET /api/reports/:report.xlsx
    throw new Error("Backend Integration Pending");
  },
  async downloadPdf(_report: string): Promise<void> {
    // TODO: GET /api/reports/:report.pdf
    throw new Error("Backend Integration Pending");
  },
  async export(_report: string): Promise<void> {
    // TODO: POST /api/reports/:report/export
    throw new Error("Backend Integration Pending");
  },
};
