export const getIntervalResponseData = {
  emptyArray: [],
  oneEvent: [
    {
      id: '2',
      timestamp: '2023-12-13 00:03:00.000',
      vehicleId: 'spring-3',
      event: 'error',
    },
  ],
  sameTypeEvents: [
    {
      id: '3',
      timestamp: '2023-12-13 00:03:00.000',
      vehicleId: 'spring-3',
      event: 'error',
    },
    {
      id: '4',
      timestamp: '2023-12-13 00:04:00.000',
      vehicleId: 'spring-3',
      event: 'error',
    },
    {
      id: '5',
      timestamp: '2023-12-13 00:05:00.000',
      vehicleId: 'spring-3',
      event: 'error',
    },
  ],
};

export const getPreviousEventResponseData = {
  valid: {
    id: '1',
    timestamp: '2023-12-13 00:02:00.000',
    vehicleId: 'spring-3',
    event: 'offline',
  },
  notDefinedValue: undefined,
};
