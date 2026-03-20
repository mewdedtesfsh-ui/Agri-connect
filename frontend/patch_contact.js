const fs = require('fs');
const path = require('path');

const amPath = path.join(__dirname, 'src/i18n/locales/am.json');
const amData = JSON.parse(fs.readFileSync(amPath, 'utf8'));

amData.contact = {
    "title": "ያግኙን",
    "subtitle": "ከቡድናችን ጋር ይገናኙ። እርስዎ እንዲሳካዎት ለማገዝ እዚህ መጥተናል።",
    "sendMessage": "መልእክት ላኩልን",
    "fullName": "ሙሉ ስም",
    "emailAddress": "የኢሜይል አድራሻ",
    "phoneNumber": "ስልክ ቁጥር",
    "subject": "ርዕስ",
    "message": "መልእክት",
    "sendButton": "መልእክት ላክ",
    "getInTouch": "ያግኙን",
    "address": "አድራሻ",
    "addressLine1": "አዲስ አበባ፣ ኢትዮጵያ",
    "addressLine2": "ቦሌ ክፍለ ከተማ፣ ወረዳ 03",
    "phone": "ስልክ",
    "phoneNumber1": "+251 11 123 4567",
    "phoneNumber2": "+251 91 234 5678",
    "email": "ኢሜይል",
    "emailAddress1": "info@agriconnect.et",
    "emailAddress2": "support@agriconnect.et",
    "businessHours": "የስራ ሰዓት",
    "hoursMonFri": "ሰኞ - አርብ: ከጠዋቱ 2:00 - ከምሽቱ 12:00",
    "hoursSat": "ቅዳሜ: ከጠዋቱ 3:00 - ከቀኑ 10:00",
    "hoursSun": "እሁድ: ዝግ ነው",
    "needHelp": "አፋጣኝ እርዳታ ይፈልጋሉ?",
    "urgentSupport": "ለአስቸኳይ ቴክኒካዊ ድጋፍ ወይም የመለያ ጉዳዮች፣ በዚህ በኩል ሊያገኙን ይችላሉ፦",
    "whatsapp": "ዋትስአፕ",
    "emergency": "ድንገተኛ አደጋ",
    "fullNamePlaceholder": "የእርስዎ ሙሉ ስም",
    "emailPlaceholder": "your@email.com",
    "phonePlaceholder": "+251 11 123 4567",
    "subjectPlaceholder": "እንዴት ልንረዳዎ እንችላለን?",
    "messagePlaceholder": "ስለጥያቄዎ የበለጠ ይንገሩን..."
};

fs.writeFileSync(amPath, JSON.stringify(amData, null, 2), 'utf8');
console.log('Contact Us translation block aggressively patched.');
