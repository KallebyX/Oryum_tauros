#!/bin/bash

# Fix ESG.tsx
sed -i 's/checklists.map((checklist) => {/checklists.map((checklist: any) => {/g' client/src/pages/ESG.tsx

# Fix Inventory.tsx - add null checks
sed -i 's/item.quantity <= (item.minStock || 0)/item.quantity !== null \&\& item.quantity <= (item.minStock || 0)/g' client/src/pages/Inventory.tsx

echo "TypeScript fixes applied"
