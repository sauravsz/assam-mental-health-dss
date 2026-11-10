export interface RawDistrictData {
  id: string
  name: string
  zone: 'Barak Valley' | 'Brahmaputra Valley' | 'Hill Districts'
  population: number
  callsLast30Days: number
  poissonExpected: number
  floodCrisis: boolean
  allocatedCamps: number
  disparityGap: 'High Deficit' | 'Moderate' | 'Equitable'
}

export const INITIAL_RAW_DISTRICTS: RawDistrictData[] = [
  { id: 'AS-01', name: 'Kamrup Metropolitan', zone: 'Brahmaputra Valley', population: 1253440, callsLast30Days: 480, poissonExpected: 360, floodCrisis: false, allocatedCamps: 4, disparityGap: 'Equitable' },
  { id: 'AS-02', name: 'Cachar', zone: 'Barak Valley', population: 1736617, callsLast30Days: 520, poissonExpected: 340, floodCrisis: true, allocatedCamps: 2, disparityGap: 'High Deficit' },
  { id: 'AS-03', name: 'Karimganj', zone: 'Barak Valley', population: 1228686, callsLast30Days: 245, poissonExpected: 190, floodCrisis: true, allocatedCamps: 1, disparityGap: 'High Deficit' },
  { id: 'AS-04', name: 'Hailakandi', zone: 'Barak Valley', population: 659296, callsLast30Days: 135, poissonExpected: 110, floodCrisis: false, allocatedCamps: 1, disparityGap: 'Moderate' },
  { id: 'AS-05', name: 'Dhubri', zone: 'Brahmaputra Valley', population: 1949258, callsLast30Days: 310, poissonExpected: 280, floodCrisis: true, allocatedCamps: 2, disparityGap: 'Moderate' },
  { id: 'AS-06', name: 'Nagaon', zone: 'Brahmaputra Valley', population: 1892550, callsLast30Days: 360, poissonExpected: 310, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Moderate' },
  { id: 'AS-07', name: 'Barpeta', zone: 'Brahmaputra Valley', population: 1693622, callsLast30Days: 280, poissonExpected: 260, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-08', name: 'Dibrugarh', zone: 'Brahmaputra Valley', population: 1326335, callsLast30Days: 295, poissonExpected: 250, floodCrisis: false, allocatedCamps: 3, disparityGap: 'Equitable' },
  { id: 'AS-09', name: 'Sonitpur', zone: 'Brahmaputra Valley', population: 1228751, callsLast30Days: 210, poissonExpected: 200, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-10', name: 'Dima Hasao', zone: 'Hill Districts', population: 214102, callsLast30Days: 52, poissonExpected: 30, floodCrisis: false, allocatedCamps: 0, disparityGap: 'High Deficit' },
  { id: 'AS-11', name: 'Karbi Anglong', zone: 'Hill Districts', population: 660955, callsLast30Days: 95, poissonExpected: 90, floodCrisis: false, allocatedCamps: 1, disparityGap: 'Moderate' },
  { id: 'AS-12', name: 'Jorhat', zone: 'Brahmaputra Valley', population: 1092256, callsLast30Days: 230, poissonExpected: 210, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-13', name: 'Lakhimpur', zone: 'Brahmaputra Valley', population: 1042137, callsLast30Days: 215, poissonExpected: 170, floodCrisis: true, allocatedCamps: 1, disparityGap: 'High Deficit' },
  { id: 'AS-14', name: 'Tinsukia', zone: 'Brahmaputra Valley', population: 1327929, callsLast30Days: 240, poissonExpected: 220, floodCrisis: false, allocatedCamps: 2, disparityGap: 'Equitable' },
  { id: 'AS-15', name: 'Golaghat', zone: 'Brahmaputra Valley', population: 1066888, callsLast30Days: 190, poissonExpected: 180, floodCrisis: false, allocatedCamps: 1, disparityGap: 'Moderate' },
]
