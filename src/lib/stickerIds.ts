export const COUNTRIES = [
  'MEX','KOR','RSA','CZE','CAN','BIH','QAT','SUI','BRA','MAR',
  'HAI','SCO','USA','PAR','AUS','TUR','GER','CUW','CIV','ECU',
  'NED','JPN','SWE','TUN','BEL','EGY','IRN','NZL','ESP','CPV',
  'KSA','URU','FRA','SEN','IRQ','NOR','ARG','ALG','AUT','JOR',
  'POR','COD','UZB','COL','ENG','CRO','GHA','PAN',
];

export const ALL_STICKER_IDS: string[] = [
  '00',
  ...Array.from({ length: 13 }, (_, i) => `FWC ${i + 1}`),
  ...COUNTRIES.flatMap(c => Array.from({ length: 20 }, (_, i) => `${c} ${i + 1}`)),
];

export const TOTAL_STICKERS = ALL_STICKER_IDS.length;
