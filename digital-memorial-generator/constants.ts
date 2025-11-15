import type { Memorial } from './types';

export const MOCK_MEMORIAL: Memorial = {
  name: 'Henry Ford',
  dates: 'July 30, 1863 – April 7, 1947',
  photoUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Henry_ford_1919.jpg/640px-Henry_ford_1919.jpg',
  epitaph:
    '“Coming together is a beginning, staying together is progress, and working together is success.” Henry Ford transformed mobility and industry, proving that imagination paired with discipline can move the world forward. This memorial preserves his story for future generations.',
  tags: ['Industrialist', 'Innovator', 'Philanthropist', 'Detroit'],
  timeline: [
    {
      id: 1,
      year: '1863',
      title: 'Born near Dearborn, Michigan',
      description:
        'Raised on a farm in Springwells Township, Henry dismantled timepieces as a boy to understand how they worked.',
    },
    {
      id: 2,
      year: '1896',
      title: 'The Quadricycle',
      description:
        'Completed and test-drove his first gasoline-powered horseless carriage through Detroit, capturing the attention of inventors and investors alike.',
    },
    {
      id: 3,
      year: '1903',
      title: 'Ford Motor Company',
      description:
        'Founded Ford Motor Company with eleven investors, aiming to build reliable automobiles the middle class could afford.',
    },
    {
      id: 4,
      year: '1908',
      title: 'Model T Revolution',
      description:
        'Launched the Model T, a rugged and inexpensive car that soon placed the world on wheels.',
    },
    {
      id: 5,
      year: '1914',
      title: 'Five-Dollar Workday',
      description:
        'Introduced the $5 workday and shorter shifts, redefining labor relations and accelerating the growth of a modern middle class.',
    },
    {
      id: 6,
      year: '1929',
      title: 'Philanthropy & Education',
      description:
        'Expanded charitable work in agriculture, healthcare, and education, laying groundwork for what would become the Ford Foundation.',
    },
    {
      id: 7,
      year: '1947',
      title: 'Legacy',
      description:
        'Passed away peacefully at Fair Lane. His manufacturing principles, peace activism, and belief in accessible technology continue to guide innovators.',
    },
  ],
  condolences: [
    {
      id: 101,
      name: 'Edsel Ford II',
      relation: 'Grandson',
      text: 'Grandfather believed innovation only matters when it improves everyday lives. We continue that promise.',
      timestamp: new Date('2024-04-07T09:30:00Z').toISOString(),
    },
    {
      id: 102,
      name: 'Clara Bryant Ford',
      relation: 'Spouse',
      text: 'Together we dreamed of a more peaceful, connected world. May this memorial keep that dream alive.',
      timestamp: new Date('2024-04-07T10:15:00Z').toISOString(),
    },
  ],
};

export const LANGUAGES: string[] = [
  'English',
  'Russian',
  'Mandarin Chinese',
  'Hindi',
  'Spanish',
  'French',
  'Standard Arabic',
  'Bengali',
  'Portuguese',
  'Urdu',
  'Indonesian',
  'German',
  'Japanese',
  'Marathi',
  'Telugu',
  'Turkish',
  'Tamil',
  'Vietnamese',
  'Tagalog',
  'Korean',
  'Iranian Persian',
  'Hausa',
  'Egyptian Spoken Arabic',
  'Swahili',
  'Javanese',
  'Italian',
  'Western Punjabi',
  'Kannada',
  'Gujarati',
  'Polish',
];
