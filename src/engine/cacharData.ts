import type { Block, Facility } from './types'

export const CACHAR_BLOCKS: Block[] = [
  { id: 0, name: 'Silchar Urban', population: 229000, baselineDistress: 1.20, floodFactor: 1.0, coords: { x: 50, y: 48 } },
  { id: 1, name: 'Lakhipur', population: 154000, baselineDistress: 0.90, floodFactor: 1.4, coords: { x: 80, y: 44 } },
  { id: 2, name: 'Sonai', population: 182000, baselineDistress: 1.10, floodFactor: 1.5, coords: { x: 64, y: 72 } },
  { id: 3, name: 'Dholai', population: 145000, baselineDistress: 0.80, floodFactor: 1.2, coords: { x: 48, y: 88 } },
  { id: 4, name: 'Katigorah', population: 168000, baselineDistress: 1.30, floodFactor: 1.8, coords: { x: 22, y: 22 } },
  { id: 5, name: 'Udharbond', population: 105000, baselineDistress: 0.85, floodFactor: 1.2, coords: { x: 58, y: 30 } },
  { id: 6, name: 'Borkhola', population: 112000, baselineDistress: 0.95, floodFactor: 1.3, coords: { x: 34, y: 34 } },
  { id: 7, name: 'Salchapra', population: 74000, baselineDistress: 0.80, floodFactor: 1.1, coords: { x: 38, y: 56 } },
]

export const CACHAR_FACILITIES: Facility[] = [
  {
    id: 0,
    name: 'SM Dev Civil Hospital (HQ)',
    blockName: 'Silchar Urban',
    capacity: 120,
    coords: { x: 50, y: 48 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Adequate', valproate: 'Adequate' },
  },
  {
    id: 1,
    name: 'Lakhipur BPHC / CHC',
    blockName: 'Lakhipur',
    capacity: 80,
    coords: { x: 80, y: 44 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Low Stock', valproate: 'Adequate' },
  },
  {
    id: 2,
    name: 'Sonai BPHC',
    blockName: 'Sonai',
    capacity: 80,
    coords: { x: 64, y: 72 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Adequate', valproate: 'Adequate' },
  },
  {
    id: 3,
    name: 'Dholai Model Hospital',
    blockName: 'Dholai',
    capacity: 70,
    coords: { x: 48, y: 88 },
    medicineStock: { haloperidol: 'Low Stock', fluoxetine: 'Critical', valproate: 'Adequate' },
  },
  {
    id: 4,
    name: 'Katigorah CHC',
    blockName: 'Katigorah',
    capacity: 80,
    coords: { x: 22, y: 22 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Critical', valproate: 'Low Stock' },
  },
  {
    id: 5,
    name: 'Borkhola PHC',
    blockName: 'Borkhola',
    capacity: 70,
    coords: { x: 34, y: 34 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Adequate', valproate: 'Adequate' },
  },
]

// Transit time matrix c_{ij} in minutes (Rows: 8 Blocks, Cols: 6 Facilities)
export const TRAVEL_TIME_MATRIX: number[][] = [
  [ 5, 45, 35, 40, 50, 25], // 0: Silchar Urban
  [45,  8, 40, 60, 80, 50], // 1: Lakhipur
  [35, 40,  6, 30, 75, 45], // 2: Sonai
  [40, 60, 30,  8, 85, 55], // 3: Dholai
  [50, 80, 75, 85,  7, 30], // 4: Katigorah
  [25, 50, 45, 55, 30, 10], // 5: Udharbond
  [25, 50, 45, 55, 30,  8], // 6: Borkhola
  [18, 55, 40, 45, 40, 20], // 7: Salchapra
]
