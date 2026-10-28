import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string): ImagePlaceholder => {
  const img = PlaceHolderImages.find((p) => p.id === id);
  if (!img) {
    return {
      id: 'error',
      description: 'Image not found',
      imageUrl: 'https://picsum.photos/seed/error/200/200',
      imageHint: 'placeholder',
    };
  }
  return img;
};

export type User = {
  id: string;
  name: string;
  avatar: ImagePlaceholder;
  accountType: 'personal' | 'private' | 'professional' | 'brand';
  following: string[];
  connections: string[];
  blockedUsers: string[];
  location?: string;
  dateOfBirth?: string;
  hasStory?: boolean;
  bio?: string;
  website?: string;
  creatorSubjects?: string[];
  email: string;
};

export type Story = {
  id: string;
  user: User;
  image: ImagePlaceholder;
  views?: User[];
  likers?: User[];
  song?: string;
};

export type Comment = {
  id: string;
  user: User;
  text: string;
  likes?: number;
  replies?: Comment[];
  audioUrl?: string;
  imageUrl?: string;
  timestamp?: string;
};

export type Post = {
  id: string;
  user: User;
  image?: ImagePlaceholder;
  images?: ImagePlaceholder[];
  caption: string;
  likes: number;
  views: number;
  comments: Comment[];
  timestamp: string;
  repostCount?: number;
  location?: string;
  song?: string;
  songUrl?: string;
  albumArtUrl?: string;
  videoUrl?: string;
  videoDuration?: number;
  videoCategory?: 'short' | 'long';
  postType?: 'profile' | 'public_pulse';
  quotedPost?: Post;
};

export type Reel = {
  id: string;
  user: User;
  videoUrl: string;
  caption: string;
  likes: number;
  views: number;
  comments: Comment[];
  shares: number;
  duration: number; // in seconds
  song?: string;
  albumArtUrl?: string;
  timestamp: string;
};

export type Call = {
    id: string;
    user: User;
    type: 'audio' | 'video';
    duration: number; // in seconds
    date: string;
    status: 'answered' | 'missed' | 'outgoing';
};

export type SharedItem = {
    id: string;
    sharedBy: User;
    content: Post | Reel;
    timestamp: string;
};

export type PulseTopic = {
  title: string;
  description?: string;
};

export const pulseTopics: PulseTopic[] = [
  { title: '💼 Business & Startup' },
  { title: '📰 News' },
  { title: '💻 Technology' },
  { title: '🤖 AI (Artificial Intelligence)' },
  { title: '🎮 Games' },
  { title: '🎓 Education' },
  { title: '🏗️ Construction' },
  { title: '📐 Architect' },
  { title: '🛋️ Interior' },
  { title: '⚙️ Mechanics' },
  { title: '📡 Electronics and Communication' },
  { title: '⚡ Electronic and Electrical' },
  { title: '🎓 Education & Career' },
  { title: '💰 Finance & Money' },
  { title: '🏠 Home & Property' },
  { title: '🚗 Vehicles' },
  { title: '🌾 Farming' },
  { title: '👨‍⚕️ General health information' },
  { title: '⚖️ Legal information' },
  { title: '🛠️ Skills & Jobs' },
  { title: '👨‍🍳 Food & Cooking' },
  { title: '👗 Fashion' },
  { title: '📱 Social Media & Marketing' },
  { title: '❤️ Relationships & Life' },
  { title: '🏋️ Fitness' },
  { title: '🌍 Travel' },
  { title: '👨‍👩‍👧 Family' },
  { title: '🔧 DIY & Repairs' },
  { title: '🛍️ Products & Shopping' },
  { title: '📚 General Knowledge' },
  { title: '🧠 Mental Wellbeing & Personal Development' },
  { title: '🐕 Pets & Animals' },
  { title: '🌱 Environment & Nature' },
  { title: '🏛️ Government & Public Services' },
  { title: '👷 Workplace & Professional Life' },
  { title: '🧑‍🤝‍🧑 Community & Local Issues' },
  { title: '🧪 Science & Research' },
  { title: '🎮 Entertainment & Hobbies' },
  { title: '🎨 Arts & Creativity' },
  { title: '🧳 Migration & Life Abroad' },
  { title: '🕉️ Culture & Traditions' },
  { title: '🏢 Organizations & NGOs' },
  { title: '🛡️ Safety & Emergency Preparedness' },
  { title: '👴 Senior Citizens' },
  { title: '👶 Children & Parenting' },
  { title: '🧑‍💻 Freelancing & Gig Economy' },
  { title: '🚀 Innovation & Ideas' },
  { title: '🏭 Manufacturing & Industry' },
  { title: '🧑‍🔬 Professional Experts' },
  { title: '🗳️ Elections & Voting' },
  { title: '🏛️ Government & Administration' },
  { title: '📜 Laws & Legislation' },
  { title: '🇮🇳 Indian Constitution & Civics' },
  { title: '🏘️ Local Government & Municipal Issues' },
  { title: '🏢 State Government' },
  { title: '🇮🇳 Central Government' },
  { title: '🌾 Agriculture & Government Policies' },
  { title: '🎓 Education Policies' },
  { title: '🏥 Public Health Policies' },
  { title: '💰 Taxes & Economic Policies' },
  { title: '👷 Employment & Labour Policies' },
  { title: '🌳 Environment Policies' },
  { title: '🚆 Infrastructure & Transport' },
  { title: '🏠 Housing & Land Policies' },
  { title: '👥 Social Welfare Schemes' },
  { title: '🌐 Foreign Policy & International Relations' },
  { title: '📰 Political News & Current Affairs' },
  { title: '👤 Public Representatives & Government Offices' },
  { title: '📊 Political Data & Public Opinion' },
  { title: '🌐 Other / Ask Anything', description: "For problems that don't fit another category." },
];


export const users: User[] = [
  { id: 'u1', name: 'alex_d', avatar: getImage('user1'), accountType: 'personal', following: ['ucurr'], connections: ['u2', 'u3'], blockedUsers: [], location: 'Zürich, Switzerland', dateOfBirth: '1992-03-15', hasStory: true, bio: 'Chasing sunsets and summits. 🏔️ Outdoor enthusiast.', website: 'https://alex-travels.com', creatorSubjects: ['Travel Vlogger', 'Photographer'], email: 'alex@example.com' },
  { id: 'u2', name: 'bella_ciao', avatar: getImage('user2'), accountType: 'professional', following: ['ucurr'], connections: ['u1', 'u4'], blockedUsers: [], location: 'Florence, Italy', dateOfBirth: '1988-11-22', hasStory: true, bio: 'Italian Chef & Food Content Creator. Sharing recipes from the heart of Tuscany. 🍝', website: 'https://bellaskitchen.it', creatorSubjects: ['Food & Cooking'], email: 'bella@example.it' },
  { id: 'u3', name: 'chris.w', avatar: getImage('user3'), accountType: 'private', following: [], connections: ['u1'], blockedUsers: [], location: 'New York, USA', dateOfBirth: '1995-07-01', hasStory: true, bio: 'Software Engineer in NYC. Just living life one bug at a time.', creatorSubjects: ['Tech Enthusiast'], email: 'chris@example.com' },
  { id: 'u4', name: 'diana.p', avatar: getImage('user4'), accountType: 'personal', following: [], connections: ['u2', 'u5'], blockedUsers: [], location: 'Paris, France', dateOfBirth: '1993-09-05', hasStory: true, bio: 'Artist, traveler, and dreamer. ✨ Exploring the beauty of France.', creatorSubjects: ['Digital Artist', 'Blogger'], email: 'diana@example.fr' },
  { id: 'u5', name: 'ethan_hunt', avatar: getImage('user5'), accountType: 'professional', following: [], connections: ['u4'], blockedUsers: [], location: 'London, UK', dateOfBirth: '1990-12-19', hasStory: true, bio: 'Digital Marketing Specialist. Helping brands grow in the digital age. 📈', creatorSubjects: ['Blogger'], email: 'ethan@example.uk' },
];

export const currentUser: User = { id: 'ucurr', name: 'John Doe', avatar: getImage('currentUser'), accountType: 'personal', following: ['u1', 'u2'], connections: ['u3', 'u4'], blockedUsers: ['u5'], location: 'San Francisco, USA', dateOfBirth: '1990-01-01', hasStory: true, bio: 'Full-stack developer with a passion for building intuitive user experiences. 🚀', website: 'https://johndoe.dev', creatorSubjects: [], email: 'john@example.com' };

export const stories: Story[] = [
  { id: 's-curr', user: currentUser, image: getImage('post14'), views: users.slice(0, 3), likers: users.slice(0,1), song: 'Starlight - MUSE' },
  { id: 's1', user: users[0], image: getImage('story1'), song: 'Island in the Sun - Weezer' },
  { id: 's2', user: users[1], image: getImage('story2'), song: 'Run Boy Run - Woodkid' },
  { id: 's3', user: users[2], image: getImage('story3'), song: 'City of Stars - La Land' },
  { id: 's4', user: users[3], image: getImage('story4'), song: 'Paint It, Black - The Rolling Stones' },
  { id: 's5', user: users[4], image: getImage('story5'), song: 'Take Me Home, Country Roads - John Denver' },
];

export const posts: Post[] = [
  {
    id: 'p-multi-1',
    user: users[0],
    images: [getImage('post1'), getImage('post5'), getImage('post16')],
    caption: 'The beauty of high-altitude adventure. 🏔️ Explore the horizon with me. #Adventure #Nature',
    likes: 12500,
    views: 45000,
    repostCount: 120,
    comments: [],
    timestamp: '15m ago',
    location: 'Swiss Alps',
    postType: 'public_pulse',
  },
  {
    id: 'p-text-1',
    user: users[1],
    caption: 'The secret to great software isn’t just writing code; it’s understanding the humans who will use it. 💡 Every line of code should solve a real problem. #Engineering #UX #DesignThinking',
    likes: 3400,
    views: 12000,
    repostCount: 85,
    comments: [],
    timestamp: '30m ago',
    postType: 'public_pulse',
  },
  {
    id: 'p-long-1',
    user: users[1],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    videoDuration: 3000,
    videoCategory: 'long',
    caption: 'The Future of Professional Social Discovery: A 50-minute deep dive into curated universes and niche exploration. 🌐✨ #SocialDiscovery #ProfessionalNetwork',
    likes: 8400,
    views: 120000,
    repostCount: 450,
    comments: [],
    timestamp: '1 hour ago',
    location: 'Global Hub',
    postType: 'public_pulse',
  },
  {
    id: 'p-text-2',
    user: currentUser,
    caption: 'Sometimes the best productivity hack is just to step away from the screen. A walk in the park can do more for your problem-solving than an hour of staring at a bug. 🌳🚶‍♂️ #WorkLifeBalance #DeveloperLife',
    likes: 890,
    views: 4500,
    repostCount: 22,
    comments: [],
    timestamp: '2 hours ago',
    postType: 'profile',
  },
  {
    id: 'p-topic-1',
    user: users[4],
    image: getImage('post14'),
    caption: 'Big moves today! Securing our first round of funding for the new venture. 💼 Business & Startup life is a roller coaster but so worth it! 🚀 #Startup #VentureCapital',
    likes: 4200,
    views: 85000,
    repostCount: 156,
    comments: [],
    timestamp: '2 hours ago',
    location: 'London',
    postType: 'public_pulse',
  },
  {
    id: 'p-topic-2',
    user: users[2],
    image: getImage('post7'),
    caption: 'Deep diving into the latest 🤖 AI (Artificial Intelligence) models. The speed of progress in 💻 Technology is absolutely mind-blowing. 🧠✨ #ArtificialIntelligence #FutureTech',
    likes: 3100,
    views: 42000,
    repostCount: 89,
    comments: [],
    timestamp: '4 hours ago',
    location: 'New York',
    postType: 'public_pulse',
  },
  {
    id: 'p1',
    user: users[0],
    image: getImage('post1'),
    caption: 'Fresh morning in the Alps. Breathable air and infinite views. 🏔️ #MountainEscape #NaturePhotography',
    likes: 1540,
    views: 18000,
    repostCount: 20,
    comments: [
      { id: 'c1', user: users[2], text: 'Wow, the lighting is perfect!' },
    ],
    timestamp: '1 hour ago',
    location: 'Zermatt, Switzerland',
    song: 'Starlight - MUSE',
    songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    postType: 'profile',
  },
  {
    id: 'p2',
    user: currentUser,
    image: getImage('post14'),
    caption: 'New workspace setup is finally complete! Ready to ship some code. 💻🚀 #Developer #WorkFromHome',
    likes: 950,
    views: 5200,
    repostCount: 12,
    comments: [
      { id: 'c2', user: users[4], text: 'Looking clean! Which monitor is that?' },
    ],
    timestamp: '2 hours ago',
    location: 'San Francisco, CA',
    postType: 'profile',
  },
  {
    id: 'p3',
    user: users[1],
    image: getImage('post2'),
    caption: "Handmade tagliatelle with a secret family sauce. This is what Sundays are for. 🍝✨ #ItalianCuisine #FoodieLife",
    likes: 2100,
    views: 12500,
    repostCount: 45,
    comments: [],
    timestamp: '4 hours ago',
    location: 'Florence, Italy',
    song: 'Italian Dinner - Tuscany Vibes',
    songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    postType: 'public_pulse',
  },
  {
    id: 'p4',
    user: users[2],
    image: getImage('post3'),
    caption: 'Neon lights and city nights. New York, you never fail to amaze. 🌃🗽 #NYC #Cityscape',
    likes: 1890,
    views: 32000,
    repostCount: 55,
    comments: [],
    timestamp: '6 hours ago',
    location: 'Times Square, NY',
    song: 'City of Stars - La Land',
    songUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    postType: 'profile',
  },
  {
    id: 'p5',
    user: currentUser,
    image: getImage('post12'),
    caption: 'Front row seats at the jazz festival last night. The energy was electric! 🎷🎶 #LiveMusic #JazzNight',
    likes: 740,
    views: 4100,
    repostCount: 8,
    comments: [],
    timestamp: 'Yesterday',
    location: 'San Francisco',
    postType: 'public_pulse',
  },
  {
    id: 'p6',
    user: users[3],
    image: getImage('post11'),
    caption: 'My constant companion while I work. 🐈💤 #CatLovers #OfficePet',
    likes: 3200,
    views: 15000,
    repostCount: 10,
    comments: [],
    timestamp: 'Yesterday',
    postType: 'profile',
  },
  {
    id: 'p7',
    user: users[4],
    image: getImage('post18'),
    caption: 'Street style in London. Exploring the hidden alleys of Soho. 🧥🇬🇧 #StreetPhotography #Fashion',
    likes: 1100,
    views: 9800,
    repostCount: 30,
    comments: [],
    timestamp: '2 days ago',
    location: 'Soho, London',
    postType: 'profile',
  },
  {
    id: 'p8',
    user: currentUser,
    image: getImage('post9'),
    caption: 'Classic California brunch. Avocado toast and sunshine. 🥑☀️ #BrunchTime #WeekendVibes',
    likes: 560,
    views: 3800,
    repostCount: 5,
    comments: [],
    timestamp: '3 days ago',
    location: 'Palo Alto, CA',
    postType: 'profile',
  },
  {
    id: 'p9',
    user: users[0],
    image: getImage('post7'),
    caption: 'Debugging mode: ON. ☕️⌨️ #Coding #LifeOfADev',
    likes: 1200,
    views: 8400,
    repostCount: 15,
    comments: [],
    timestamp: '4 days ago',
    postType: 'public_pulse',
  },
  {
    id: 'p10',
    user: users[3],
    image: getImage('post8'),
    caption: 'Morning walks with the best boy. 🐾🌲 #GoldenRetriever #NatureWalks',
    likes: 4500,
    views: 22000,
    repostCount: 12,
    comments: [],
    timestamp: '5 days ago',
    location: 'Hyde Park, London',
    postType: 'profile',
  },
];

export const reels: Reel[] = [
  {
    id: 'r-topic-1',
    user: users[1],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    caption: 'Top 5 tools for every 💼 Business & Startup founder in 2024. Efficiency is key! 🛠️💼 #Founders #BusinessHacks',
    likes: 12500,
    views: 250000,
    comments: [],
    shares: 1200,
    duration: 30,
    timestamp: '1 hour ago',
  },
  {
    id: 'r1',
    user: currentUser,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    caption: 'Driving through the Redwood forest. Nature is truly grand. 🌲🚗 #RoadTrip #Nature',
    likes: 2450,
    views: 12000,
    comments: [
        { id: 'rc1', user: users[0], text: 'I need to visit this place!' }
    ],
    shares: 150,
    duration: 15,
    song: 'Run Boy Run - Woodkid',
    timestamp: '2 hours ago',
  },
  {
    id: 'r2',
    user: users[4],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    caption: 'Quick highlights from our Soho event! 🎊✨ #MarketingLife #EventPlanning',
    likes: 3100,
    views: 45000,
    comments: [],
    shares: 280,
    duration: 12,
    timestamp: '5 hours ago',
  },
  {
    id: 'r3',
    user: users[1],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    caption: 'Baking process: Fluffy focaccia from scratch! 🍞🌿 #BakingReel #FoodScience',
    likes: 5200,
    views: 68000,
    comments: [],
    shares: 410,
    duration: 45,
    timestamp: '1 day ago',
  },
  {
    id: 'r4',
    user: currentUser,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    caption: 'CGI Breakdown: How we built the futuristic city. 🌆📽️ #VFX #FilmmakingTips',
    likes: 8900,
    views: 110000,
    comments: [],
    shares: 950,
    duration: 60,
    song: 'Harder, Better, Faster, Stronger - Daft Punk',
    timestamp: '2 days ago',
  },
  {
    id: 'r5',
    user: users[2],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    caption: 'Taking the new build out for a spin. 🏎️💨 #CarCulture #Drift',
    likes: 3400,
    views: 28000,
    comments: [],
    shares: 120,
    duration: 30,
    timestamp: '3 days ago',
  },
];

export const callHistory: Call[] = [
    { id: 'call1', user: users[0], type: 'video', duration: 300, date: '2024-07-20T10:00:00Z', status: 'answered' },
    { id: 'call2', user: users[1], type: 'audio', duration: 120, date: '2024-07-20T11:30:00Z', status: 'missed' },
];

export const sharedItems: SharedItem[] = [
  { id: 'si1', sharedBy: users[3], content: posts[0], timestamp: '1h ago' },
  { id: 'si2', sharedBy: users[1], content: reels[0], timestamp: '3h ago' },
];
