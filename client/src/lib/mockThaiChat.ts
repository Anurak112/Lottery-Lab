/**
 * Mock Thai Chat Generator
 * Generates realistic Thai lottery-related chat messages from random users
 */

// Thai first names (common nicknames)
const THAI_FIRST_NAMES = [
  'สมชาย', 'สมหญิง', 'วิชัย', 'วิภา', 'ประเสริฐ', 'ประภา',
  'สุชาติ', 'สุภา', 'อนันต์', 'อรุณ', 'มานะ', 'มาลี',
  'ชัยวัฒน์', 'ชุติมา', 'พิชัย', 'พิมพ์', 'ธนา', 'ธิดา',
  'กิตติ', 'กัญญา', 'ณัฐ', 'นภา', 'ปรีชา', 'ปราณี',
  'รัตน์', 'รุ่ง', 'ศักดิ์', 'ศิริ', 'สันติ', 'สุนีย์',
  'อภิชาติ', 'อัญชลี', 'เอก', 'แอน', 'บอย', 'เบล',
  'แก้ว', 'ก้อย', 'ตาล', 'ต้น', 'นุ่น', 'น้อย',
  'ปลา', 'ปอ', 'มิ้น', 'มด', 'แนน', 'นิด',
  'ออม', 'โอ๋', 'ฟ้า', 'ฝน', 'หมู', 'หมี',
];

// Thai nicknames with numbers (like real usernames)
const THAI_NICKNAMES = [
  'หวยเด็ด', 'เลขดัง', 'เซียนหวย', 'คนดวงดี', 'โชคดี',
  'เสี่ยงโชค', 'ลุ้นรวย', 'รวยทุกงวด', 'หวยรัฐบาล', 'เลขเด็ด',
  'ดวงดี', 'โชคลาภ', 'เฮงเฮง', 'รวยรวย', 'ถูกหวย',
  'แม่นทุกงวด', 'เลขมงคล', 'หวยดัง', 'เซียนเลข', 'คนโชคดี',
];

// Lottery-related Thai messages
const LOTTERY_MESSAGES = [
  // Excitement messages
  'ลุ้นๆๆๆ 🎉',
  'ขอให้ถูกรางวัลที่ 1 ด้วยเถอะ 🙏',
  'งวดนี้ต้องถูก!',
  'ใครซื้อเลขอะไรบ้าง?',
  'เลขเด็ดงวดนี้คืออะไร?',
  'ลุ้นหนักมาก 😱',
  'ขอโชคดีทุกคนนะ 🍀',
  'หวังว่าจะถูกสักงวด',
  
  // Number sharing
  'เลขท้าย 2 ตัว 22 มาแน่!',
  'งวดนี้ 56 มาแรง',
  '89 เลขเด็ดจากฝัน',
  'ใครมีเลขเด็ดบ้าง แชร์หน่อย',
  'เลข 3 ตัว 137 ลองดู',
  'งวดที่แล้วพลาดไป เสียดาย',
  '00 มาบ่อยนะ',
  'เลขท้าย 77 ดูดี',
  
  // Reactions
  'ตื่นเต้นมาก!',
  'ใจเต้นแรง 💓',
  'รอลุ้นอยู่',
  'มาดูสดกัน',
  'ถ่ายทอดสดชัดมาก',
  'คุณภาพดีจัง',
  
  // Prayers and wishes
  'ขอพรให้ถูกรางวัล 🙏',
  'สาธุ ขอให้ถูกหวย',
  'ขอให้โชคดีทุกคน',
  'งวดนี้ต้องรวย!',
  'ขอให้ถูกรางวัลใหญ่',
  
  // Questions
  'ออกกี่โมงคะ?',
  'รางวัลที่ 1 ออกหรือยัง?',
  'เลขท้าย 2 ตัวออกอะไร?',
  'ใครถูกบ้าง?',
  'งวดหน้าวันไหน?',
  
  // Comments about the stream
  'ดูสดกันเลย',
  'ถ่ายทอดสดคมชัด',
  'เสียงชัดดี',
  'ขอบคุณที่ถ่ายทอดสด',
  'ดีใจที่มีช่องนี้',
  
  // Emoji reactions
  '🎰🎰🎰',
  '💰💰💰',
  '🍀🍀🍀',
  '🙏🙏🙏',
  '😍😍😍',
  '🤞🤞🤞',
  
  // Short exclamations
  'มาแล้ว!',
  'ลุ้น!',
  'เฮ้!',
  'โอ้โห!',
  'ว้าว!',
  'เยส!',
  
  // Number predictions
  'งวดนี้ 42 มาแน่นอน',
  'เลข 19 ดูดี',
  '65 เลขมงคล',
  '38 จากความฝัน',
  '91 เลขเด็ดวันนี้',
  '27 ลองเสี่ยงดู',
  '84 มาแรงมาก',
  '53 เลขนำโชค',
];

// Generate random Thai username
export function generateThaiUsername(): string {
  const useNickname = Math.random() > 0.5;
  
  if (useNickname) {
    const nickname = THAI_NICKNAMES[Math.floor(Math.random() * THAI_NICKNAMES.length)];
    const number = Math.floor(Math.random() * 9999);
    return `${nickname}${number}`;
  } else {
    const firstName = THAI_FIRST_NAMES[Math.floor(Math.random() * THAI_FIRST_NAMES.length)];
    const suffix = Math.random() > 0.7 ? `_${Math.floor(Math.random() * 999)}` : '';
    return `${firstName}${suffix}`;
  }
}

// Generate random Thai lottery message
export function generateThaiMessage(): string {
  return LOTTERY_MESSAGES[Math.floor(Math.random() * LOTTERY_MESSAGES.length)];
}

// Calculate random interval between messages (4-15 messages per minute)
// 4 messages/min = 15000ms interval, 15 messages/min = 4000ms interval
export function getRandomMessageInterval(): number {
  const minInterval = 4000;  // 15 messages per minute
  const maxInterval = 15000; // 4 messages per minute
  return Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval;
}

// Generate a complete mock comment
export function generateMockComment(id: number) {
  return {
    id,
    user: generateThaiUsername(),
    text: generateThaiMessage(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isGuest: true,
    source: 'website' as const,
  };
}
