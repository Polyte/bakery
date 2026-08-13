export const BANKING_DETAILS = {
  bank: "First National Bank (FNB)",
  accountName: "Dadda's Confectionery (Pty) Ltd",
  accountNumber: "62840193847",
  branchCode: "250655",
  accountType: "Current / Cheque",
  swift: "FIRNZAJJ",
} as const

export type BankingField = {
  label: string
  value: string
}

export function bankingFields(): BankingField[] {
  return [
    { label: "Bank", value: BANKING_DETAILS.bank },
    { label: "Account name", value: BANKING_DETAILS.accountName },
    { label: "Account number", value: BANKING_DETAILS.accountNumber },
    { label: "Branch code", value: BANKING_DETAILS.branchCode },
    { label: "Account type", value: BANKING_DETAILS.accountType },
    { label: "SWIFT", value: BANKING_DETAILS.swift },
  ]
}
