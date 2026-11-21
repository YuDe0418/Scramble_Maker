export const exportSizes = {
  square: { label: '1080 × 1080', width: 1080, height: 1080 },
  fullHd: { label: '1920 × 1080', width: 1920, height: 1080 },
  ultraHd: { label: '3840 × 2160 (4K)', width: 3840, height: 2160 },
};

export type ExportOptions = { size: keyof typeof exportSizes; transparent: boolean; includeFormula: boolean };
export type ExportView = (options: ExportOptions) => Promise<Blob>;
