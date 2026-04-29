# Wallet Balance Response Fix - Implementation TODO

## Steps

- [x] 1. Analyze files and understand current implementation
- [ ] 2. Update `src/services/wallet.service.ts` - new response types, handle both asset shapes, fix pagination
- [ ] 3. Update `src/types/wallet.types.ts` - add new fields
- [ ] 4. Create `src/hooks/useRelativeTime.ts` - live relative time hook
- [ ] 5. Update `src/components/wallet/WalletBalance.tsx` - handle accountExists, lastUpdated, assetType/assetCode
- [ ] 6. Update `src/components/wallet/WalletBalanceCard.tsx` - handle both asset shapes
- [ ] 7. Update `src/pages/WalletDashboardPage.tsx` - use new response shape, pass props
- [ ] 8. Update `src/components/wallet/TransactionHistoryList.tsx` - fix pagination shape
- [ ] 9. Update tests in `src/components/wallet/__tests__/WalletBalance.test.tsx`
- [ ] 10. Run TypeScript check and tests to verify

