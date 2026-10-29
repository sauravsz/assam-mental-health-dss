import type { Block, Facility } from './types'

export const CACHAR_BLOCKS: Block[] = [
  { id: 0, name: 'Silchar Urban', population: 230000, baselineDistress: 0.04, floodFactor: 1.0, coords: { x: 50, y: 48 } },
  { id: 1, name: 'Lakhipur', population: 120000, baselineDistress: 0.06, floodFactor: 1.4, coords: { x: 82, y: 44 } },
  { id: 2, name: 'Sonai', population: 160000, baselineDistress: 0.05, floodFactor: 1.5, coords: { x: 62, y: 72 } },
  { id: 3, name: 'Dholai', population: 140000, baselineDistress: 0.05, floodFactor: 1.3, coords: { x: 48, y: 88 } },
  { id: 4, name: 'Katigorah', population: 180000, baselineDistress: 0.06, floodFactor: 1.8, coords: { x: 20, y: 20 } },
  { id: 5, name: 'Udharbond', population: 110000, baselineDistress: 0.04, floodFactor: 1.2, coords: { x: 64, y: 32 } },
  { id: 6, name: 'Borkhola', population: 130000, baselineDistress: 0.05, floodFactor: 1.3, coords: { x: 32, y: 32 } },
  { id: 7, name: 'Salchapra', population: 90000, baselineDistress: 0.04, floodFactor: 1.1, coords: { x: 36, y: 56 } },
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
    name: 'Lakhipur BPHC/CHC',
    blockName: 'Lakhipur',
    capacity: 80,
    coords: { x: 82, y: 44 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Low Stock', valproate: 'Adequate' },
  },
  {
    id: 2,
    name: 'Sonai BPHC',
    blockName: 'Sonai',
    capacity: 80,
    coords: { x: 62, y: 72 },
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
    coords: { x: 20, y: 20 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Critical', valproate: 'Low Stock' },
  },
  {
    id: 5,
    name: 'Borkhola PHC',
    blockName: 'Borkhola',
    capacity: 70,
    coords: { x: 32, y: 32 },
    medicineStock: { haloperidol: 'Adequate', fluoxetine: 'Adequate', valproate: 'Adequate' },
  },
]

// Exact road travel transit matrix c_{ij} in minutes (Rows: 8 Blocks, Cols: 6 Facilities)
// Synchronized 1:1 with test_suite.py empirical benchmark
export const TRAVEL_TIME_MATRIX: number[][] = [
  [  0.0,  63.3,  47.9,  83.2,  75.9,  51.5 ], // 0: Silchar Urban
  [ 66.3,   3.7,  81.0, 114.7, 129.3, 104.1 ], // 1: Lakhipur
  [ 53.6,  79.6,   5.8,  32.9, 122.7, 101.3 ], // 2: Sonai
  [ 91.0, 119.1,  45.4,   8.2, 150.2, 132.5 ], // 3: Dholai
  [ 83.2, 134.0, 124.3, 151.2,   7.4,  32.6 ], // 4: Katigorah
  [ 46.9,  46.3,  87.2, 124.4,  86.2,  62.5 ], // 5: Udharbond
  [ 55.2, 105.4,  99.0, 129.1,  22.2,   3.7 ], // 6: Borkhola
  [ 33.8,  96.5,  53.6,  77.9,  66.3,  49.7 ], // 7: Salchapra
]
