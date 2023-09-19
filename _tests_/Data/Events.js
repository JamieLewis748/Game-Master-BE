exports.events = [
  {
    _id: "1",
    image: 'https://example.com/event1.jpg',
    gameInfo: 'Event 1 - Board Game Night',
    isGameFull: false,
    gameType: 'Board Games',
    dateTime: '2023-09-20 18:00:00',
    participants: ["1", "2"],
    requestedToParticipate:[]
  },
  {
    _id: "2",
    image: 'https://example.com/event2.jpg',
    gameInfo: 'Event 2 - Family Board Games',
    isGameFull: true,
    gameType: 'Board Games',
    dateTime: '2023-09-21 19:30:00',
    participants: ["1", "3"],
    requestedToParticipate:[]
  },
  {
    _id: "3",
    image: 'https://example.com/event3.jpg',
    gameInfo: 'Event 3 - Chess Tournament',
    isGameFull: false,
    gameType: 'Board Games',
    dateTime: '2023-09-22 14:00:00',
    participants: ["2", "4"],
    requestedToParticipate:[]
  },
];
