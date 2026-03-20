const fs = require('fs');
const path = require('path');

// Read translation files
const enPath = path.join(__dirname, 'src/i18n/locales/en.json');
const amPath = path.join(__dirname, 'src/i18n/locales/am.json');

const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const amTranslations = JSON.parse(fs.readFileSync(amPath, 'utf8'));

// Add all missing translation keys
const newKeys = {
  // Language switcher
  lang: {
    switchToAmharic: "Switch to Amharic",
    switchToEnglish: "Switch to English"
  },
  
  // Contact page
  contact: {
    title: "Contact Us",
    subtitle: "Get in touch with our team. We're here to help you succeed.",
    sendMessage: "Send us a message",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    subject: "Subject",
    message: "Message",
    sendButton: "Send Message",
    getInTouch: "Get in touch",
    address: "Address",
    addressLine1: "Addis Ababa, Ethiopia",
    addressLine2: "Bole Sub City, Woreda 03",
    phone: "Phone",
    phoneNumber1: "+251 11 123 4567",
    phoneNumber2: "+251 91 234 5678",
    email: "Email",
    emailAddress1: "info@agriconnect.et",
    emailAddress2: "support@agriconnect.et",
    businessHours: "Business Hours",
    hoursMonFri: "Monday - Friday: 8:00 AM - 6:00 PM",
    hoursSat: "Saturday: 9:00 AM - 4:00 PM",
    hoursSun: "Sunday: Closed",
    needHelp: "Need immediate help?",
    urgentSupport: "For urgent technical support or account issues, you can reach us through:",
    whatsapp: "WhatsApp",
    emergency: "Emergency",
    fullNamePlaceholder: "Your full name",
    emailPlaceholder: "your@email.com",
    phonePlaceholder: "+251 11 123 4567",
    subjectPlaceholder: "How can we help you?",
    messagePlaceholder: "Tell us more about your inquiry..."
  },
  
  // Rating interface
  rating: {
    yourRating: "Your Rating",
    rateThisAdvice: "Rate this advice",
    star: "star",
    stars: "stars",
    addReview: "+ Add a review (optional)",
    yourReview: "Your Review (optional)",
    reviewPlaceholder: "Share your experience with this advice...",
    charactersLimit: "characters",
    removeReview: "Remove review",
    submitting: "Submitting...",
    updateRating: "Update Rating",
    submitRating: "Submit Rating",
    selectRating: "Please select a rating",
    reviewTooLong: "Review must be 1000 characters or less",
    failedToSubmit: "Failed to submit rating"
  },
  
  // Crops and Prices Management
  cropsAndPrices: {
    title: "Crops & Prices Management",
    subtitle: "Manage crops and their market prices",
    manageCrops: "Manage Crops",
    managePrices: "Manage Prices",
    addCrop: "Add Crop",
    editCrop: "Edit Crop",
    addNewCrop: "Add New Crop",
    cropName: "Crop Name",
    category: "Category",
    createCrop: "Create Crop",
    updateCrop: "Update Crop",
    deleteCrop: "Delete Crop",
    confirmDeleteCrop: "Are you sure? This will delete all associated prices.",
    cropNamePlaceholder: "e.g., Wheat, Corn",
    categoryPlaceholder: "e.g., Grain, Vegetable",
    addPrice: "Add Price",
    addNewPrice: "Add New Price",
    crop: "Crop",
    market: "Market",
    region: "Region",
    price: "Price (ETB)",
    lastUpdated: "Last Updated",
    createPrice: "Create Price",
    deletePrice: "Delete Price",
    confirmDeletePrice: "Are you sure you want to delete this price record?",
    selectCrop: "Select Crop",
    selectMarket: "Select Market",
    pricePlaceholder: "0.00",
    crops: "Crops",
    prices: "Prices",
    id: "ID",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel"
  }
};

// Amharic translations
const newKeysAm = {
  lang: {
    switchToAmharic: "ወደ አማርኛ ቀይር",
    switchToEnglish: "ወደ እንግሊዝኛ ቀይር"
  },
  
  contact: {
    title: "አግኙን",
    subtitle: "ከቡድናችን ጋር ይገናኙ። ስኬታማ እንዲሆኑ እዚህ ነን።",
    sendMessage: "መልእክት ይላኩልን",
    fullName: "ሙሉ ስም",
    emailAddress: "የኢሜይል አድራሻ",
    phoneNumber: "ስልክ ቁጥር",
    subject: "ርዕስ",
    message: "መልእክት",
    sendButton: "መልእክት ላክ",
    getInTouch: "ይገናኙ",
    address: "አድራሻ",
    addressLine1: "አዲስ አበባ፣ ኢትዮጵያ",
    addressLine2: "ቦሌ ክፍለ ከተማ፣ ወረዳ 03",
    phone: "ስልክ",
    phoneNumber1: "+251 11 123 4567",
    phoneNumber2: "+251 91 234 5678",
    email: "ኢሜይል",
    emailAddress1: "info@agriconnect.et",
    emailAddress2: "support@agriconnect.et",
    businessHours: "የስራ ሰዓታት",
    hoursMonFri: "ሰኞ - አርብ: 8:00 ጠዋት - 6:00 ምሽት",
    hoursSat: "ቅዳሜ: 9:00 ጠዋት - 4:00 ከሰዓት",
    hoursSun: "እሁድ: ዝግ",
    needHelp: "አስቸኳይ እገዛ ይፈልጋሉ?",
    urgentSupport: "ለአስቸኳይ ቴክኒካል ድጋፍ ወይም የመለያ ጉዳዮች፣ በሚከተሉት ማግኘት ይችላሉ:",
    whatsapp: "ዋትስአፕ",
    emergency: "አስቸኳይ",
    fullNamePlaceholder: "የእርስዎ ሙሉ ስም",
    emailPlaceholder: "የእርስዎ@ኢሜይል.com",
    phonePlaceholder: "+251 11 123 4567",
    subjectPlaceholder: "እንዴት ልንረዳዎት እንችላለን?",
    messagePlaceholder: "ስለ ጥያቄዎ ተጨማሪ ይንገሩን..."
  },
  
  rating: {
    yourRating: "የእርስዎ ደረጃ",
    rateThisAdvice: "ይህን ምክር ደረጃ ይስጡ",
    star: "ኮከብ",
    stars: "ኮከቦች",
    addReview: "+ ግምገማ ጨምር (አማራጭ)",
    yourReview: "የእርስዎ ግምገማ (አማራጭ)",
    reviewPlaceholder: "ስለዚህ ምክር ያለዎትን ልምድ ያጋሩ...",
    charactersLimit: "ቁምፊዎች",
    removeReview: "ግምገማ አስወግድ",
    submitting: "በመላክ ላይ...",
    updateRating: "ደረጃ አዘምን",
    submitRating: "ደረጃ ላክ",
    selectRating: "እባክዎ ደረጃ ይምረጡ",
    reviewTooLong: "ግምገማ ከ1000 ቁምፊዎች በታች መሆን አለበት",
    failedToSubmit: "ደረጃ መላክ አልተሳካም"
  },
  
  cropsAndPrices: {
    title: "የሰብሎች እና ዋጋዎች አስተዳደር",
    subtitle: "ሰብሎችን እና የገበያ ዋጋቸውን ያስተዳድሩ",
    manageCrops: "ሰብሎችን አስተዳድር",
    managePrices: "ዋጋዎችን አስተዳድር",
    addCrop: "ሰብል ጨምር",
    editCrop: "ሰብል አርትዕ",
    addNewCrop: "አዲስ ሰብል ጨምር",
    cropName: "የሰብል ስም",
    category: "ምድብ",
    createCrop: "ሰብል ፍጠር",
    updateCrop: "ሰብል አዘምን",
    deleteCrop: "ሰብል ሰርዝ",
    confirmDeleteCrop: "እርግጠኛ ነዎት? ይህ ሁሉንም ተያያዥ ዋጋዎች ይሰርዛል።",
    cropNamePlaceholder: "ለምሳሌ፣ ስንዴ፣ በቆሎ",
    categoryPlaceholder: "ለምሳሌ፣ እህል፣ አትክልት",
    addPrice: "ዋጋ ጨምር",
    addNewPrice: "አዲስ ዋጋ ጨምር",
    crop: "ሰብል",
    market: "ገበያ",
    region: "ክልል",
    price: "ዋጋ (ብር)",
    lastUpdated: "መጨረሻ የዘመነ",
    createPrice: "ዋጋ ፍጠር",
    deletePrice: "ዋጋ ሰርዝ",
    confirmDeletePrice: "ይህን የዋጋ መዝገብ መሰረዝ እርግጠኛ ነዎት?",
    selectCrop: "ሰብል ይምረጡ",
    selectMarket: "ገበያ ይምረጡ",
    pricePlaceholder: "0.00",
    crops: "ሰብሎች",
    prices: "ዋጋዎች",
    id: "መለያ",
    actions: "ድርጊቶች",
    edit: "አርትዕ",
    delete: "ሰርዝ",
    cancel: "ሰርዝ"
  }
};

// Merge new keys into existing translations
function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

mergeDeep(enTranslations, newKeys);
mergeDeep(amTranslations, newKeysAm);

// Write updated translations
fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
fs.writeFileSync(amPath, JSON.stringify(amTranslations, null, 2), 'utf8');

console.log('✅ Translation keys added successfully!');
console.log(`English keys: ${Object.keys(enTranslations).length}`);
console.log(`Amharic keys: ${Object.keys(amTranslations).length}`);
