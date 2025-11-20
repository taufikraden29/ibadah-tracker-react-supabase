import { supabase } from '../lib/supabaseClient'
import { Database } from '../lib/supabaseClient'

type QuranProgress = Database['public']['Tables']['quran_progress']['Row']
type QuranProgressInsert = Database['public']['Tables']['quran_progress']['Insert']
type QuranProgressUpdate = Database['public']['Tables']['quran_progress']['Update']

export interface SurahInfo {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  revelationType: 'Meccan' | 'Medinan'
  ayahs: number
  pages: {
    start: number
    end: number
  }
}

export interface QuranReadingSession {
  id?: string
  surah: number
  ayahStart: number
  ayahEnd: number
  pagesRead: number
  notes?: string
  timestamp?: string
}

// Quran Surah data with Arabic names, English names, and page numbers
export const QURAN_SURAH_DATA: SurahInfo[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opener", revelationType: "Meccan", ayahs: 7, pages: { start: 1, end: 1 } },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", revelationType: "Medinan", ayahs: 286, pages: { start: 2, end: 49 } },
  { number: 3, name: "آل عمران", englishName: "Aal-E-Imran", englishNameTranslation: "The Family of Imran", revelationType: "Medinan", ayahs: 200, pages: { start: 50, end: 76 } },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishNameTranslation: "The Women", revelationType: "Medinan", ayahs: 176, pages: { start: 77, end: 106 } },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishNameTranslation: "The Table Spread", revelationType: "Medinan", ayahs: 120, pages: { start: 106, end: 127 } },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", englishNameTranslation: "The Cattle", revelationType: "Meccan", ayahs: 165, pages: { start: 128, end: 151 } },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishNameTranslation: "The Heights", revelationType: "Meccan", ayahs: 206, pages: { start: 151, end: 176 } },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", englishNameTranslation: "The Spoils of War", revelationType: "Medinan", ayahs: 75, pages: { start: 177, end: 186 } },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", englishNameTranslation: "The Repentance", revelationType: "Medinan", ayahs: 129, pages: { start: 187, end: 207 } },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", revelationType: "Meccan", ayahs: 109, pages: { start: 208, end: 221 } },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", revelationType: "Meccan", ayahs: 123, pages: { start: 221, end: 235 } },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", revelationType: "Meccan", ayahs: 111, pages: { start: 235, end: 248 } },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", revelationType: "Medinan", ayahs: 43, pages: { start: 249, end: 255 } },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", revelationType: "Meccan", ayahs: 52, pages: { start: 255, end: 262 } },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Stoneland", revelationType: "Meccan", ayahs: 99, pages: { start: 262, end: 267 } },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", revelationType: "Meccan", ayahs: 128, pages: { start: 267, end: 281 } },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", englishNameTranslation: "The Night Journey", revelationType: "Meccan", ayahs: 111, pages: { start: 282, end: 293 } },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", revelationType: "Meccan", ayahs: 110, pages: { start: 293, end: 304 } },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", revelationType: "Meccan", ayahs: 98, pages: { start: 304, end: 311 } },
  { number: 20, name: "طه", englishName: "Taha", englishNameTranslation: "Taha", revelationType: "Meccan", ayahs: 135, pages: { start: 312, end: 322 } },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", englishNameTranslation: "The Prophets", revelationType: "Meccan", ayahs: 112, pages: { start: 322, end: 332 } },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", revelationType: "Medinan", ayahs: 78, pages: { start: 332, end: 342 } },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", englishNameTranslation: "The Believers", revelationType: "Meccan", ayahs: 118, pages: { start: 342, end: 349 } },
  { number: 24, name: "النور", englishName: "An-Nur", englishNameTranslation: "The Light", revelationType: "Medinan", ayahs: 64, pages: { start: 349, end: 359 } },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", englishNameTranslation: "The Criterion", revelationType: "Meccan", ayahs: 77, pages: { start: 359, end: 366 } },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", englishNameTranslation: "The Poets", revelationType: "Meccan", ayahs: 227, pages: { start: 367, end: 377 } },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", revelationType: "Meccan", ayahs: 93, pages: { start: 377, end: 385 } },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", revelationType: "Meccan", ayahs: 88, pages: { start: 385, end: 396 } },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", englishNameTranslation: "The Spider", revelationType: "Meccan", ayahs: 69, pages: { start: 396, end: 404 } },
  { number: 30, name: "الروم", englishName: "Ar-Rum", englishNameTranslation: "The Romans", revelationType: "Meccan", ayahs: 60, pages: { start: 404, end: 410 } },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", revelationType: "Meccan", ayahs: 34, pages: { start: 410, end: 415 } },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", englishNameTranslation: "The Prostration", revelationType: "Meccan", ayahs: 30, pages: { start: 415, end: 418 } },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", englishNameTranslation: "The Combined Forces", revelationType: "Medinan", ayahs: 73, pages: { start: 418, end: 428 } },
  { number: 34, name: "سبأ", englishName: "Saba", englishNameTranslation: "Sheba", revelationType: "Meccan", ayahs: 54, pages: { start: 428, end: 434 } },
  { number: 35, name: "فاطر", englishName: "Fatir", englishNameTranslation: "The Originator", revelationType: "Meccan", ayahs: 45, pages: { start: 434, end: 440 } },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya Sin", revelationType: "Meccan", ayahs: 83, pages: { start: 440, end: 445 } },
  { number: 37, name: "الصافات", englishName: "As-Saffat", englishNameTranslation: "Those who set the Ranks", revelationType: "Meccan", ayahs: 182, pages: { start: 445, end: 453 } },
  { number: 38, name: "ص", englishName: "Sad", englishNameTranslation: "The Letter Sad", revelationType: "Meccan", ayahs: 88, pages: { start: 453, end: 458 } },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", revelationType: "Meccan", ayahs: 75, pages: { start: 458, end: 467 } },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", revelationType: "Meccan", ayahs: 85, pages: { start: 467, end: 477 } },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", revelationType: "Meccan", ayahs: 54, pages: { start: 477, end: 483 } },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", revelationType: "Meccan", ayahs: 53, pages: { start: 483, end: 489 } },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", revelationType: "Meccan", ayahs: 89, pages: { start: 489, end: 496 } },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", englishNameTranslation: "The Smoke", revelationType: "Meccan", ayahs: 59, pages: { start: 496, end: 500 } },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", englishNameTranslation: "The Crouching", revelationType: "Meccan", ayahs: 37, pages: { start: 500, end: 504 } },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", revelationType: "Meccan", ayahs: 35, pages: { start: 504, end: 508 } },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", revelationType: "Medinan", ayahs: 38, pages: { start: 508, end: 511 } },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", revelationType: "Medinan", ayahs: 29, pages: { start: 511, end: 515 } },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", englishNameTranslation: "The Rooms", revelationType: "Medinan", ayahs: 18, pages: { start: 515, end: 517 } },
  { number: 50, name: "ق", englishName: "Qaf", englishNameTranslation: "The Letter Qaf", revelationType: "Meccan", ayahs: 45, pages: { start: 517, end: 520 } },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", englishNameTranslation: "The Winnowing Winds", revelationType: "Meccan", ayahs: 60, pages: { start: 520, end: 523 } },
  { number: 52, name: "الطور", englishName: "At-Tur", englishNameTranslation: "The Mount", revelationType: "Meccan", ayahs: 49, pages: { start: 523, end: 525 } },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", revelationType: "Meccan", ayahs: 62, pages: { start: 525, end: 527 } },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", revelationType: "Meccan", ayahs: 55, pages: { start: 527, end: 529 } },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", revelationType: "Medinan", ayahs: 78, pages: { start: 529, end: 531 } },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", englishNameTranslation: "The Inevitable", revelationType: "Meccan", ayahs: 96, pages: { start: 531, end: 534 } },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", revelationType: "Medinan", ayahs: 29, pages: { start: 534, end: 537 } },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", englishNameTranslation: "The Pleading Woman", revelationType: "Medinan", ayahs: 22, pages: { start: 537, end: 539 } },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", revelationType: "Medinan", ayahs: 24, pages: { start: 539, end: 542 } },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", englishNameTranslation: "She that is to be examined", revelationType: "Medinan", ayahs: 13, pages: { start: 542, end: 544 } },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", revelationType: "Medinan", ayahs: 14, pages: { start: 544, end: 545 } },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", englishNameTranslation: "The Friday", revelationType: "Medinan", ayahs: 11, pages: { start: 545, end: 546 } },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", englishNameTranslation: "The Hypocrites", revelationType: "Medinan", ayahs: 11, pages: { start: 546, end: 547 } },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", englishNameTranslation: "The Mutual Disillusion", revelationType: "Medinan", ayahs: 18, pages: { start: 547, end: 549 } },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", englishNameTranslation: "The Divorce", revelationType: "Medinan", ayahs: 12, pages: { start: 549, end: 550 } },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", revelationType: "Medinan", ayahs: 12, pages: { start: 550, end: 551 } },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", revelationType: "Meccan", ayahs: 30, pages: { start: 551, end: 552 } },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", revelationType: "Meccan", ayahs: 52, pages: { start: 552, end: 554 } },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", englishNameTranslation: "The Reality", revelationType: "Meccan", ayahs: 52, pages: { start: 554, end: 555 } },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", englishNameTranslation: "The Ascending Stairways", revelationType: "Meccan", ayahs: 44, pages: { start: 555, end: 557 } },
  { number: 71, name: "نوح", englishName: "Nuh", englishNameTranslation: "Noah", revelationType: "Meccan", ayahs: 28, pages: { start: 557, end: 558 } },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", revelationType: "Meccan", ayahs: 28, pages: { start: 558, end: 560 } },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", revelationType: "Meccan", ayahs: 20, pages: { start: 560, end: 561 } },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", revelationType: "Meccan", ayahs: 56, pages: { start: 561, end: 562 } },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", englishNameTranslation: "The Resurrection", revelationType: "Meccan", ayahs: 40, pages: { start: 562, end: 564 } },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", englishNameTranslation: "The Man", revelationType: "Medinan", ayahs: 31, pages: { start: 564, end: 565 } },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", englishNameTranslation: "The Emissaries", revelationType: "Meccan", ayahs: 50, pages: { start: 565, end: 566 } },
  { number: 78, name: "النبأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", revelationType: "Meccan", ayahs: 40, pages: { start: 566, end: 568 } },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", englishNameTranslation: "Those who drag forth", revelationType: "Meccan", ayahs: 46, pages: { start: 568, end: 569 } },
  { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He frowned", revelationType: "Meccan", ayahs: 42, pages: { start: 569, end: 571 } },
  { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", revelationType: "Meccan", ayahs: 29, pages: { start: 571, end: 572 } },
  { number: 82, name: "الإنفطار", englishName: "Al-Infitar", englishNameTranslation: "The Cleaving", revelationType: "Meccan", ayahs: 19, pages: { start: 572, end: 573 } },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "Defrauding", revelationType: "Meccan", ayahs: 36, pages: { start: 573, end: 574 } },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", englishNameTranslation: "The Splitting Open", revelationType: "Meccan", ayahs: 25, pages: { start: 574, end: 575 } },
  { number: 85, name: "البروج", englishName: "Al-Buruj", englishNameTranslation: "The Mansions of the Stars", revelationType: "Meccan", ayahs: 22, pages: { start: 575, end: 576 } },
  { number: 86, name: "الطارق", englishName: "At-Tariq", englishNameTranslation: "The Nightcomer", revelationType: "Meccan", ayahs: 17, pages: { start: 576, end: 577 } },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", englishNameTranslation: "The Most High", revelationType: "Meccan", ayahs: 19, pages: { start: 577, end: 578 } },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", englishNameTranslation: "The Overwhelming", revelationType: "Meccan", ayahs: 26, pages: { start: 578, end: 579 } },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", revelationType: "Meccan", ayahs: 30, pages: { start: 579, end: 580 } },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", revelationType: "Meccan", ayahs: 20, pages: { start: 580, end: 581 } },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", revelationType: "Meccan", ayahs: 15, pages: { start: 581, end: 582 } },
  { number: 92, name: "الليل", englishName: "Al-Lail", englishNameTranslation: "The Night", revelationType: "Meccan", ayahs: 21, pages: { start: 582, end: 583 } },
  { number: 93, name: "الضحى", englishName: "Ad-Dhuha", englishNameTranslation: "The Morning Hours", revelationType: "Meccan", ayahs: 11, pages: { start: 583, end: 584 } },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", revelationType: "Meccan", ayahs: 8, pages: { start: 584, end: 584 } },
  { number: 95, name: "التين", englishName: "At-Tin", englishNameTranslation: "The Fig", revelationType: "Meccan", ayahs: 8, pages: { start: 584, end: 585 } },
  { number: 96, name: "العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", revelationType: "Meccan", ayahs: 19, pages: { start: 585, end: 586 } },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", revelationType: "Meccan", ayahs: 5, pages: { start: 586, end: 586 } },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", englishNameTranslation: "The Evidence", revelationType: "Medinan", ayahs: 8, pages: { start: 586, end: 587 } },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", englishNameTranslation: "The Earthquake", revelationType: "Medinan", ayahs: 8, pages: { start: 587, end: 588 } },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", englishNameTranslation: "The Chargers", revelationType: "Meccan", ayahs: 11, pages: { start: 588, end: 588 } },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", englishNameTranslation: "The Calamity", revelationType: "Meccan", ayahs: 11, pages: { start: 588, end: 589 } },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", englishNameTranslation: "The Rivalry in World Increase", revelationType: "Meccan", ayahs: 8, pages: { start: 589, end: 589 } },
  { number: 103, name: "العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day", revelationType: "Meccan", ayahs: 3, pages: { start: 589, end: 590 } },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", englishNameTranslation: "The Traducer", revelationType: "Meccan", ayahs: 9, pages: { start: 590, end: 590 } },
  { number: 105, name: "الفيل", englishName: "Al-Fil", englishNameTranslation: "The Elephant", revelationType: "Meccan", ayahs: 5, pages: { start: 590, end: 591 } },
  { number: 106, name: "قريش", englishName: "Quraysh", englishNameTranslation: "Quraysh", revelationType: "Meccan", ayahs: 4, pages: { start: 591, end: 591 } },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", englishNameTranslation: "The Small Kindness", revelationType: "Meccan", ayahs: 7, pages: { start: 591, end: 591 } },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", revelationType: "Meccan", ayahs: 3, pages: { start: 591, end: 592 } },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", englishNameTranslation: "The Disbelievers", revelationType: "Meccan", ayahs: 6, pages: { start: 592, end: 592 } },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", revelationType: "Medinan", ayahs: 3, pages: { start: 592, end: 592 } },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fiber", revelationType: "Meccan", ayahs: 5, pages: { start: 592, end: 593 } },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", revelationType: "Meccan", ayahs: 4, pages: { start: 593, end: 593 } },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", revelationType: "Meccan", ayahs: 5, pages: { start: 593, end: 593 } },
  { number: 114, name: "الناس", englishName: "An-Nas", englishNameTranslation: "The Mankind", revelationType: "Meccan", ayahs: 6, pages: { start: 593, end: 604 } }
]

// Database operations for Quran progress
export async function logQuranReading(session: QuranProgressInsert): Promise<QuranProgress> {
  const { data, error } = await supabase
    .from('quran_progress')
    .insert(session)
    .select()
    .single()

  if (error) {
    throw new Error(`Error logging Quran reading: ${error.message}`)
  }

  return data
}

export async function getQuranProgress(userId: string, limit: number = 50): Promise<QuranProgress[]> {
  const { data, error } = await supabase
    .from('quran_progress')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Error fetching Quran progress: ${error.message}`)
  }

  return data || []
}

export async function getQuranStats(userId: string, days: number = 30): Promise<{
  totalSessions: number
  totalPagesRead: number
  totalAyahsRead: number
  averagePagesPerSession: number
  currentStreak: number
  longestStreak: number
  recentlyReadSurahs: Array<{ surah: number; surahName: string; sessions: number; pagesRead: number }>
}> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]

  const { data: sessions, error } = await supabase
    .from('quran_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDateStr)
    .order('timestamp', { ascending: true })

  if (error) {
    throw new Error(`Error fetching Quran stats: ${error.message}`)
  }

  const sessionsData = sessions || []
  const totalPagesRead = sessionsData.reduce((sum, session) => sum + session.pages_read, 0)
  const totalAyahsRead = sessionsData.reduce((sum, session) => sum + (session.ayah_end - session.ayah_start + 1), 0)

  // Calculate streaks
  const streakData = calculateStreaks(sessionsData)

  // Calculate recently read surahs
  const surahMap = new Map<number, { sessions: number; pagesRead: number }>()
  sessionsData.forEach(session => {
    const current = surahMap.get(session.surah) || { sessions: 0, pagesRead: 0 }
    surahMap.set(session.surah, {
      sessions: current.sessions + 1,
      pagesRead: current.pagesRead + session.pages_read,
    })
  })

  const recentlyReadSurahs = Array.from(surahMap.entries())
    .map(([surah, stats]) => {
      const surahInfo = QURAN_SURAH_DATA.find(s => s.number === surah)
      return {
        surah,
        surahName: surahInfo?.englishName || `Surah ${surah}`,
        sessions: stats.sessions,
        pagesRead: stats.pagesRead,
      }
    })
    .sort((a, b) => b.pagesRead - a.pagesRead)
    .slice(0, 5)

  return {
    totalSessions: sessionsData.length,
    totalPagesRead,
    totalAyahsRead,
    averagePagesPerSession: sessionsData.length > 0 ? totalPagesRead / sessionsData.length : 0,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    recentlyReadSurahs,
  }
}

function calculateStreaks(sessions: QuranProgress[]): { currentStreak: number; longestStreak: number } {
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 }

  const dates = [...new Set(sessions.map(s => s.timestamp.split('T')[0]))].sort()

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i]
    const expectedDate = i === dates.length - 1 ? today :
      new Date(new Date(dates[i + 1]).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    if (date === expectedDate || (i === dates.length - 1 && (date === today || date === yesterday))) {
      tempStreak++
      if (i === dates.length - 1) {
        currentStreak = tempStreak
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  return { currentStreak, longestStreak }
}

export async function deleteQuranSession(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('quran_progress')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Error deleting Quran session: ${error.message}`)
  }
}