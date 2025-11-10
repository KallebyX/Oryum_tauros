#!/bin/bash

# Fix Challenges.tsx - adicionar tipo any em todos os maps
sed -i 's/progress?.map((p) => p.challengeId)/progress?.map((p: any) => p.challengeId)/g' client/src/pages/Challenges.tsx
sed -i 's/progress?.find((p) => p.challengeId/progress?.find((p: any) => p.challengeId/g' client/src/pages/Challenges.tsx

# Fix Planning.tsx - encontrar e corrigir o toggleComplete
sed -i 's/toggleComplete.mutate({ id: event.id, completed: !event.completed })/toggleComplete.mutate({ id: event.id })/g' client/src/pages/Planning.tsx

echo "Final TypeScript fixes applied"
