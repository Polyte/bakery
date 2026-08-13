export const BANKING_DETAILS = {
  bank: "Capitec",
  accountName: "MISS MMABATHO SHAKOANE",
  accountType: "Main Account",
  accountNumber: "1398614864",
  swift: "CABLZAJJ",
  branchCode: "470010",
  payshap: "0726775070",
} as const

export type BankingField = {
  label: string
  value: string
}

export function bankingFields(): BankingField[] {
  return [
    { label: "Bank", value: BANKING_DETAILS.bank },
    { label: "Account holder", value: BANKING_DETAILS.accountName },
    { label: "Account type", value: BANKING_DETAILS.accountType },
    { label: "Account number / IBAN", value: BANKING_DETAILS.accountNumber },
    { label: "SWIFT / BIC", value: BANKING_DETAILS.swift },
    { label: "Branch code", value: BANKING_DETAILS.branchCode },
    { label: "PayShap (Standard Bank)", value: BANKING_DETAILS.payshap },
  ]
}
