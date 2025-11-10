#!/bin/bash

# Fix ESG.tsx - usar score e maxScore ao invés de obtained e total
sed -i 's/{score?.obtained || 0} de {score?.total || 0}/{score?.score || 0} de {score?.maxScore || 0}/g' client/src/pages/ESG.tsx

# Fix Challenges.tsx - adicionar tipo any
sed -i 's/challenges.map((challenge) => (/challenges.map((challenge: any) => (/g' client/src/pages/Challenges.tsx

# Fix Planning.tsx - remover completed do toggleComplete
sed -i 's/toggleComplete.mutate({ id: event.id, completed: !event.completed });/toggleComplete.mutate({ id: event.id });/g' client/src/pages/Planning.tsx

echo "Remaining TypeScript fixes applied"
