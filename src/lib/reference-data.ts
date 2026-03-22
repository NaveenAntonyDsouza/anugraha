// Reference data for dropdowns — sourced from reference_data.json

export const heightList = Array.from({ length: 80 }, (_, i) => {
  const cm = 134 + i;
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm / 2.54) % 12);
  return `${cm} cm (${feet}' ${inches}")`;
});

export const complexionList = [
  "Very Fair",
  "Fair",
  "Moderate Fair",
  "Medium",
  "Dark",
  "Prefer Not to Say",
];

export const bodyTypeList = [
  "Slim",
  "Athletic",
  "Average",
  "Heavy",
  "Prefer Not to Say",
];

export const physicalStatusList = ["Normal", "Differently Abled"];

export const maritalStatusList = [
  "Unmarried",
  "Divorcee",
  "Awaiting Divorce",
  "Widower",
  "Annulled",
];

export const familyStatusList = [
  "Lower middle class",
  "Middle Class",
  "Upper middle class",
  "Rich",
];

export const religionList = [
  "Christian",
  "Hindu",
  "Muslim",
  "Jain",
  "No Religion",
  "Other",
];

export const educationLevelList = [
  "High School",
  "Diploma",
  "Bachelor's",
  "Master's",
  "PhD",
  "PG Diploma",
];

export const employmentCategoryList = [
  "Central Govt.",
  "Entrepreneurship",
  "Govt.",
  "MNC",
  "Others",
  "Overseas",
  "Own Business",
  "Private",
  "Public Limited",
  "Semi Govt.",
];

export const annualIncomeList = [
  "Upto 1 Lakh",
  "1 - 2 Lakhs",
  "2 - 3 Lakhs",
  "3 - 4 Lakhs",
  "4 - 5 Lakhs",
  "5 - 7.5 Lakhs",
  "7.5 - 10 Lakhs",
  "10 - 15 Lakhs",
  "15 - 20 Lakhs",
  "20 - 30 Lakhs",
  "30 - 50 Lakhs",
  "50 - 75 Lakhs",
  "75 Lakhs - 1 Crore",
  "1 Crore and More",
];

export const createdByList = [
  "Brother",
  "Candidate",
  "Father",
  "Friends",
  "Mother",
  "Relatives",
  "Sister",
];

export const howDidYouHearList = [
  { label: "Online", options: ["Google Search", "Facebook", "Instagram", "YouTube", "Other Social Media"] },
  { label: "Offline", options: ["Newspaper", "Magazine", "Friend/Family Referral", "Church/Temple/Mosque", "Anugraha Magazine"] },
];

export const educationalQualificationsList = [
  { label: "Engineering", options: ["B.E / B.Tech", "M.E / M.Tech", "B.Arch", "M.Arch"] },
  { label: "Medical", options: ["MBBS", "MD", "BDS", "MDS", "BAMS", "BHMS", "B.Pharm", "M.Pharm", "BPT", "MPT", "BSc Nursing", "MSc Nursing"] },
  { label: "Arts & Science", options: ["BA", "MA", "BSc", "MSc", "B.Com", "M.Com", "BBA", "MBA", "BCA", "MCA"] },
  { label: "Law", options: ["LLB", "LLM", "BL"] },
  { label: "Education", options: ["B.Ed", "M.Ed", "D.Ed"] },
  { label: "Other", options: ["PhD / Doctorate", "Diploma", "ITI", "High School", "Other"] },
];

export const occupationCategoryList = [
  { label: "IT & Software", options: ["Software Engineer", "Data Scientist", "Web Developer", "System Administrator", "IT Manager", "Other IT Professional"] },
  { label: "Medical & Healthcare", options: ["Doctor", "Nurse", "Pharmacist", "Dentist", "Physiotherapist", "Other Medical Professional"] },
  { label: "Engineering", options: ["Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Chemical Engineer", "Other Engineer"] },
  { label: "Education", options: ["Professor", "Teacher", "Lecturer", "Researcher", "Other Education Professional"] },
  { label: "Business & Finance", options: ["Chartered Accountant", "Business Owner", "Banker", "Financial Analyst", "Other Business Professional"] },
  { label: "Government", options: ["IAS / IPS / IFS", "State Government", "Central Government", "Defence / Armed Forces", "Other Government"] },
  { label: "Other", options: ["Self Employed", "Farmer", "Not Working", "Student", "Other"] },
];

export const raasiList = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
  "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
  "Tula (Libra)", "Vrischika (Scorpio)", "Dhanu (Sagittarius)",
  "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

export const nakshatraList = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
  "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const gothramList = [
  "Angirasa", "Atri", "Bharadwaja", "Gautama",
  "Jamadagni", "Kashyapa", "Vasishta", "Vishwamitra",
];

export const denominationList = [
  { label: "Catholic", options: ["Latin Catholic", "Syro-Malabar Catholic", "Syro-Malankara Catholic", "Anglo-Indian Catholic"] },
  { label: "Non-Catholic", options: ["Church of South India (CSI)", "Church of North India (CNI)", "Marthoma", "Jacobite", "Orthodox", "Pentecostal", "Evangelical", "Baptist", "Methodist", "Lutheran", "Salvation Army", "Brethren", "Seventh Day Adventist", "Other"] },
];

export const casteList = [
  "Brahmin", "Kshatriya", "Vaishya", "Shudra",
  "Nair", "Menon", "Pillai", "Naidu", "Reddy",
  "Chettiar", "Mudaliar", "Gounder", "Thevar",
  "Rajput", "Maratha", "Jat", "Gujjar",
  "Kayastha", "Agarwal", "Baniya", "Khatri",
  "Lingayat", "Vokkaliga", "Ezhava", "Namboodiri",
  "Iyer", "Iyengar", "Vanniyar", "Nadar",
  "SC / ST", "OBC", "Other",
];

export const subCasteList = [
  "Smartha", "Vadama", "Vathima", "Brihatcharanam",
  "Ashtasahasram", "Mandyam", "Hebbar",
  "Thenkalai", "Vadakalai",
  "Havyaka", "Deshastha", "Chitpavan",
  "Saraswat", "Karhade", "Other",
];

export const jamathList = [
  "Sunni", "Shia", "Ahmadiyya", "Bohra",
  "Memon", "Khoja", "Mappila", "Syed",
  "Sheikh", "Pathan", "Mughal", "Other",
];

// ─── Slice 2A: Additional Onboarding ───

export const weightList = Array.from({ length: 101 }, (_, i) => `${40 + i} Kg`).concat([
  "140+ Kg",
  "Prefer Not to Say",
]);

export const bloodGroupList = [
  "A+ve", "A-ve", "AB+ve", "AB-ve",
  "B+ve", "B-ve", "O+ve", "O-ve",
  "A1+ve", "Prefer Not to Say",
];

export const motherTongueList = [
  "English", "Hindi", "Kannada", "Konkani", "Malayalam",
  "Marathi", "Tamil", "Telugu", "Tulu",
  "Bengali", "Gujarati", "Punjabi", "Urdu",
  "French", "German", "Spanish", "Arabic",
];

export const residentialStatusList = [
  "Permanent Resident",
  "Citizen",
  "Work Permit",
  "Student Visa",
  "Temporary Visa",
];

export const preferredCallTimeList = [
  "Morning (8 AM - 12 PM)",
  "Afternoon (12 PM - 4 PM)",
  "Evening (4 PM - 8 PM)",
  "Night (8 PM - 10 PM)",
  "Any Time",
];

export const branchList = [
  "Any", "Bangalore", "Calicut", "Coimbatore", "Delhi",
  "Kannur", "Kollam", "Kottayam", "Mumbai",
  "Pala", "Thiruvananthapuram", "Thrisur", "USA",
];

export const countryList = [
  {
    label: "Frequently Used",
    options: [
      "India", "USA", "UAE", "United Kingdom", "Canada",
      "Australia", "Saudi Arabia", "Qatar", "New Zealand",
      "Oman", "Singapore", "Switzerland", "Bahrain",
      "France", "Germany", "Ireland", "Italy", "Kuwait", "Malta",
    ],
  },
  {
    label: "Other Countries",
    options: [
      "Afghanistan", "Albania", "Algeria", "Argentina", "Austria",
      "Bangladesh", "Belgium", "Brazil", "China", "Denmark",
      "Egypt", "Finland", "Greece", "Hong Kong", "Indonesia",
      "Japan", "Kenya", "Malaysia", "Mexico", "Nepal",
      "Netherlands", "Nigeria", "Norway", "Pakistan", "Philippines",
      "Poland", "Portugal", "Russia", "South Africa", "South Korea",
      "Spain", "Sri Lanka", "Sweden", "Thailand", "Turkey",
      "Vietnam",
    ],
  },
];

// ─── Slice 2B: Partner Preferences ───

export const childrenStatusList = ["Any", "Having Children", "No Children"];

export const muslimSectList = ["Sunni", "Shia", "Other"];

export const jainSectList = ["Digambara", "Shvetambara", "Other"];

export const manglikList = ["Yes", "No", "Doesn't Matter"];

export const differentlyAbledCategoryList = [
  "Deaf & Dumb",
  "Dwarfism",
  "Hearing Impairment",
  "Learning Disability",
  "Low Vision",
  "Mild Physical Disability",
  "Moderate Physical Disability",
  "Severe Physical Disability",
  "Speech Impairment",
  "Visual Impairment",
  "Wheelchair User",
  "Other",
];

export const dioceseList = [
  "Adilabad", "Agartala", "Agra", "Ahmedabad", "Aizawl", "Ajmer", "Allahabad", "Alleppey",
  "Ambikapur", "Amravati", "Asansol", "Aurangabad", "Bagdogra", "Balasore", "Bangalore",
  "Bareilly", "Baroda", "Baruipur", "Belgaum", "Bellary", "Belthangady", "Berhampur",
  "Bettiah", "Bhagalpur", "Bhopal", "Bijnor", "Bombay", "Bongaigaon", "Calcutta", "Calicut",
  "Chanda", "Changanacherry", "Chengalpattu", "Chennai-Mylapore", "Chickmagalur", "Cochin",
  "Coimbatore", "Cuddapah", "Cuttack-Bhubaneswar", "Daltonganj", "Darjeeling", "Delhi",
  "Dharmapuri", "Dibrugarh", "Diphu", "Dumka", "Durgapur", "Eluru", "Ernakulam-Angamaly",
  "Faridabad", "Gandhinagar", "Gangtok", "Goa and Daman", "Gorakhpur", "Gulbarga", "Guntur",
  "Guwahati", "Gwalior", "Hazaribag", "Hyderabad", "Idukki", "Imphal", "Indore",
  "Irinjalakuda", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jalpaiguri",
  "Jammu-Srinagar", "Jamshedpur", "Jhansi", "Jhabua", "Jodhpur", "Kalyan", "Kanjirapally",
  "Kannur", "Karwar", "Khammam", "Khandwa", "Khunti", "Kohima", "Kothamangalam",
  "Kottapuram", "Kottar", "Kottayam", "Krishnagar", "Kumbakonam", "Kurnool", "Lucknow",
  "Madurai", "Mananthavady", "Mangalore", "Mavelikara", "Meerut", "Miao", "Muzaffarpur",
  "Mysore", "Nagpur", "Nalgonda", "Nashik", "Nellore", "Neyyattinkara", "Nongstoin",
  "Ootacamund", "Palai", "Palayamkottai", "Palghat", "Parassala", "Pathanamthitta", "Patna",
  "Pondicherry and Cuddalore", "Poona", "Port Blair", "Punalur", "Pune", "Purnea", "Quilon",
  "Raiganj", "Raigarh", "Raipur", "Rajkot", "Ranchi", "Rourkela", "Sagar", "Salem",
  "Sambalpur", "Satna", "Shillong", "Shimoga", "Silchar", "Simdega", "Sivagangai",
  "Srikakulam", "Sultanpet", "Surat", "Tezpur", "Thamarassery", "Thanjavur", "Thuckalay",
  "Tiruchirapalli", "Tiruvalla", "Trichur", "Trivandrum", "Tura", "Tuticorin", "Udaipur",
  "Udupi", "Ujjain", "Varanasi", "Vellore", "Verapoly", "Vijayapuram", "Vijayawada",
  "Visakhapatnam", "Warangal", "Other",
];

export const indianStateList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const karnatakaDistrictList = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
  "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal",
  "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir",
];

// ─── Lifestyle & Hobbies ───

export const eatingHabitsList = [
  "Vegetarian", "Non-Vegetarian", "Eggetarian", "Jain", "Vegan",
];

export const drinkingHabitsList = ["No", "Yes", "Socially"];

export const smokingHabitsList = ["No", "Yes", "Occasionally"];

export const culturalBackgroundList = [
  "Traditional", "Moderate", "Modern", "Liberal",
];

export const hobbiesList = [
  "Cooking", "Nature", "Dancing", "Painting", "Pets", "Photography",
  "Puzzles", "Gardening", "Art / Handicraft", "Listening to Music",
  "Movies", "Internet Surfing", "Traveling",
];

export const musicList = [
  "Film Songs", "Indian / Classical Music", "Western Music",
];

export const booksList = [
  "Biographies", "Classic Literature", "Comics", "History",
  "Magazines", "Philosophy / Spiritual", "Short Stories",
];

export const moviesList = [
  "Action", "Comedy", "Drama", "Romance", "Horror",
  "Classics", "Documentaries", "Thriller", "World Cinema",
];

export const sportsList = [
  "Badminton", "Basketball", "Cricket", "Cycling", "Football",
  "Jogging / Walking", "Swimming", "Tennis", "Volleyball",
  "Yoga / Meditation", "Gym / Fitness", "Carrom", "Chess",
];

export const cuisineList = [
  "South Indian", "North Indian", "Chinese", "Italian",
  "Continental", "Thai", "Mexican", "Arabic",
];

export const spokenLanguagesList = [
  "English", "Hindi", "Kannada", "Konkani", "Malayalam", "Marathi",
  "Tamil", "Telugu", "Tulu", "Bengali", "Gujarati", "Punjabi",
  "Urdu", "French", "German", "Spanish", "Arabic",
];
