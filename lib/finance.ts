/** Share of the vehicle price paid up front. */
export const DOWN_PAYMENT_RATE = 0.6;
/** Share of the vehicle price paid in installments. */
export const FINANCED_RATE = 0.4;
/** Installment plans on offer. */
export const TERMS = [12, 24] as const;
export type Term = (typeof TERMS)[number];

export interface Financing {
  price: number;
  /** 60% of the price, paid up front. */
  downPayment: number;
  /** 40% of the price, split into equal installments. */
  financed: number;
  /** Equal monthly installment; there is no interest. */
  monthly: number;
  termMonths: Term;
  /** Always 0: installments are interest-free. */
  interestRate: 0;
}

/** 60% down, the remaining 40% in 12 or 24 equal installments at 0% interest. */
export function calculateFinancing(price: number, termMonths: Term): Financing {
  const safe = Number.isFinite(price) && price > 0 ? price : 0;
  const financed = safe * FINANCED_RATE;
  return {
    price: safe,
    downPayment: safe * DOWN_PAYMENT_RATE,
    financed,
    monthly: financed / termMonths,
    termMonths,
    interestRate: 0,
  };
}
