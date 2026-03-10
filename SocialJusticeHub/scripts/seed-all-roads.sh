#!/bin/bash
# Seed all 7 new course roads for El Instante del Hombre Gris
# Run from the SocialJusticeHub directory

set -e

echo "=== Seeding All Course Roads ==="
echo ""

echo "Road 3: El Tejido Vivo (community) - 3 courses"
npx tsx scripts/seed-courses-road3.ts
echo ""

echo "Road 2: La Economía del Hombre Gris (economia) - 4 courses"
npx tsx scripts/seed-courses-road2.ts
echo ""

echo "Road 6: El Fuego Interior (reflection) - 4 courses"
npx tsx scripts/seed-courses-road6.ts
echo ""

echo "Road 7: El Taller del Ciudadano (action) - 3 courses"
npx tsx scripts/seed-courses-road7.ts
echo ""

echo "Road 1: La República Inteligente (civica) - 3 courses"
npx tsx scripts/seed-courses-road1.ts
echo ""

echo "Road 4: La Palabra Precisa (comunicacion) - 3 courses"
npx tsx scripts/seed-courses-road4.ts
echo ""

echo "Road 5: Raíces Vivas (hombre-gris) - 3 courses"
npx tsx scripts/seed-courses-road5.ts
echo ""

echo "=== All roads seeded successfully! ==="
echo "Total: 23 new courses across 7 roads"
