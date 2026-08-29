/**
 * Pan-India States, Districts, and Cities Hierarchy
 * Covers all 28 States and 8 Union Territories
 */

export const indiaLocations = {
  "Maharashtra": {
    districts: ["Pune", "Mumbai Suburban", "Mumbai City", "Nagpur", "Nashik", "Thane", "Aurangabad (Chhatrapati Sambhaji Nagar)", "Kolhapur", "Solapur", "Amravati", "Nanded", "Jalgaon", "Sangli", "Satara", "Ahmednagar", "Ratnagiri", "Raigad", "Sindhudurg", "Akola", "Latur", "Dhule", "Chandrapur", "Parbhani", "Beed", "Yavatmal", "Gondia", "Wardha", "Bhandara", "Gadchiroli", "Washim", "Hingoli", "Jalna", "Nandurbar", "Palghar", "Osmanabad (Dharashiv)"],
    cities: {
      "Pune": ["All", "Shivajinagar", "Kothrud", "Hadapsar", "Hinjawadi", "Pimpri", "Chinchwad", "Baramati", "Shirur", "Baner", "Viman Nagar", "Katraj", "Magarpatta", "Wakad", "Bhosari"],
      "Mumbai Suburban": ["All", "Andheri", "Bandra", "Borivali", "Goregaon", "Kurla", "Malad", "Ghatkopar", "Kandivali", "Chembur", "Powai", "Santacruz", "Vile Parle", "Mulund"],
      "Mumbai City": ["All", "Colaba", "Dadar", "Byculla", "Parel", "Worli", "Fort", "Nariman Point", "Marine Lines", "Tardeo", "Girgaon", "Mahalaxmi"],
      "Nagpur": ["All", "Sitabuldi", "Dharampeth", "Ramdaspeth", "Manewada", "Kamptee", "Hingna", "Sadar", "Civil Lines", "Mahal"],
      "Nashik": ["All", "Panchavati", "CIDCO", "Satpur", "Indira Nagar", "Deolali", "Nashik Road", "Gangapur", "Ambad"],
      "Thane": ["All", "Naupada", "Ghodbunder", "Kalyan", "Dombivli", "Bhiwandi", "Ulhasnagar", "Mumbra", "Mira Road", "Bhayandar", "Thane West", "Wagle Estate"],
      "Aurangabad (Chhatrapati Sambhaji Nagar)": ["All", "Cidco", "Waluj", "Kranti Chowk", "Garkheda", "Chikalthana"],
      "Kolhapur": ["All", "Rajarampuri", "Tarabai Park", "Shahupuri", "Gandhinagar", "Ichalkaranji"],
      "Solapur": ["All", "Jule Solapur", "Ashok Nagar", "Bhavani Peth", "Hotgi Road"],
      "Amravati": ["All", "Badnera", "Rajapeth", "Gadge Nagar", "Camp Area"],
    }
  },
  "Delhi": {
    districts: ["Central Delhi", "New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"],
    cities: {
      "Central Delhi": ["All", "Karol Bagh", "Pahar Ganj", "Rajinder Nagar", "Daryaganj", "Chandni Chowk"],
      "New Delhi": ["All", "Connaught Place", "Chanakyapuri", "Lodhi Colony", "Vasant Vihar", "Barakhamba", "Khan Market"],
      "North Delhi": ["All", "Civil Lines", "Model Town", "Narela", "Burari", "Alipur", "Sadar Bazar"],
      "South Delhi": ["All", "Saket", "Hauz Khas", "Greater Kailash", "Mehrauli", "Malviya Nagar", "Safdarjung"],
      "East Delhi": ["All", "Preet Vihar", "Mayur Vihar", "Laxmi Nagar", "Patparganj", "Geeta Colony"],
      "West Delhi": ["All", "Janakpuri", "Rajouri Garden", "Punjabi Bagh", "Tilak Nagar", "Paschim Vihar"],
      "South East Delhi": ["All", "Lajpat Nagar", "Defence Colony", "Kalkaji", "Sarita Vihar", "Okhla"],
      "South West Delhi": ["All", "Dwarka", "Najafgarh", "Vasant Kunj", "Delhi Cantt", "Palam"],
      "North West Delhi": ["All", "Rohini", "Pitampura", "Shalimar Bagh", "Ashok Vihar"],
      "Shahdara": ["All", "Vivek Vihar", "Seemapuri", "Shahdara Main", "Dilshad Garden"],
    }
  },
  "Uttar Pradesh": {
    districts: ["Lucknow", "Varanasi", "Kanpur Nagar", "Gautam Buddha Nagar (Noida)", "Agra", "Prayagraj", "Ghaziabad", "Gorakhpur", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Jhansi", "Mathura", "Ayodhya", "Muzaffarnagar", "Firozabad", "Budaun", "Shahjahanpur", "Banda", "Sitapur", "Hardoi", "Mirzapur", "Azamgarh", "Ballia", "Jaunpur", "Basti", "Gonda", "Sultanpur"],
    cities: {
      "Lucknow": ["All", "Hazratganj", "Gomti Nagar", "Alambagh", "Indira Nagar", "Charbagh", "Mahanagar", "Aliganj", "Jankipuram"],
      "Varanasi": ["All", "Lanka", "Sigra", "Godowlia", "Bhelupur", "Shivpur", "Cantonment", "Assi Ghat", "Sarnath"],
      "Kanpur Nagar": ["All", "Civil Lines", "Kakadeo", "Kidwai Nagar", "Govind Nagar", "Swaroop Nagar", "Chakeri", "Kalyanpur"],
      "Gautam Buddha Nagar (Noida)": ["All", "Noida Sector 18", "Noida Sector 62", "Greater Noida Alpha", "Greater Noida West", "Dadri", "Sector 137", "Knowledge Park"],
      "Agra": ["All", "Tajganj", "Sanjay Place", "Kamla Nagar", "Dayalbagh", "Sadar Bazar", "Fatehabad Road"],
      "Prayagraj": ["All", "Civil Lines", "Katra", "George Town", "Naini", "Allahpur", "Tagore Town"],
      "Ghaziabad": ["All", "Indirapuram", "Vaishali", "Raj Nagar Extension", "Kaushambi", "Crossings Republik", "Vasundhara"],
      "Gorakhpur": ["All", "Golghar", "Civil Lines", "Gorakhnath", "Taramandal", "Medical College Area"],
      "Meerut": ["All", "Shastri Nagar", "Civil Lines", "Begum Bridge", "Modipuram", "Kanker Khera"],
    }
  },
  "Karnataka": {
    districts: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru (Dakshina Kannada)", "Hubballi-Dharwad", "Belagavi", "Kalaburagi", "Ballari", "Udupi", "Shivamogga", "Tumakuru", "Davangere", "Hassan", "Vijayapura", "Bidar", "Raichur", "Kolar", "Mandya", "Chikkamagaluru", "Kodagu (Coorg)", "Bagalkote", "Chitradurga", "Gadag", "Haveri", "Koppal", "Yadgir", "Ramanagara", "Chikkaballapura", "Chamarajanagar", "Vijayanagara"],
    cities: {
      "Bengaluru Urban": ["All", "Indiranagar", "Koramangala", "Whitefield", "Jayanagar", "Hebbal", "Electronic City", "HSR Layout", "Marathahalli", "Yelahanka", "Malleshwaram", "JP Nagar", "BTM Layout", "Rajajinagar"],
      "Mysuru": ["All", "Gokulam", "Jayalakshmipuram", "Kuvempunagar", "Vijayanagar", "Saraswathipuram", "Hebbal Industrial", "Nazarbad"],
      "Mangaluru (Dakshina Kannada)": ["All", "Kadri", "Kankanady", "Urwa", "Bejai", "Surathkal", "Hampankatta", "Lalbagh", "Kottara"],
      "Hubballi-Dharwad": ["All", "Vidyanagar", "Gokul Road", "Keshwapur", "Unkal", "Saptapur", "Navanagar"],
      "Belagavi": ["All", "Tilakwadi", "Camp", "Shahapur", "Udyambag", "Vadgaon"],
      "Udupi": ["All", "Manipal", "Malpe", "Brahmavar", "Kadiyali", "Ambalpady"],
      "Shivamogga": ["All", "Vinoba Nagara", "Gopala Gowda Extension", "Jayanagara", "Sharavathi Nagar"],
    }
  },
  "Gujarat": {
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Anand", "Navsari", "Bharuch", "Valsad", "Kutch", "Mehsana", "Patan", "Banaskantha", "Sabarkantha", "Panchmahal", "Dahod", "Kheda", "Amreli", "Surendranagar", "Porbandar", "Gir Somnath", "Morbi", "Devbhoomi Dwarka", "Botad", "Aravalli", "Mahisagar", "Chhota Udaipur", "Narmada", "Tapi", "Dang"],
    cities: {
      "Ahmedabad": ["All", "Navrangpura", "Satellite", "Maninagar", "Vastrapur", "Bopal", "SG Highway", "Paldi", "Ghatlodiya", "Chandkheda", "Prahlad Nagar", "Naroda", "Bodakdev"],
      "Surat": ["All", "Adajan", "Athwa", "Varachha", "Katargam", "Rander", "Vesu", "Piplod", "Palsana", "Udhna"],
      "Vadodara": ["All", "Alkapuri", "Fatehgunj", "Akota", "Manjalpur", "Gotri", "Karelibaug", "Sayajigunj", "Vasna Road"],
      "Rajkot": ["All", "Yagnik Road", "Kalawad Road", "150 Feet Ring Road", "University Road", "Kotecha Chowk", "Madhapar"],
      "Gandhinagar": ["All", "Sector 6", "Sector 11", "Sector 21", "Infocity", "Kudasan", "Raysan", "Sargasan"],
      "Bhavnagar": ["All", "Waghawadi Road", "Kalanala", "Subhashnagar", "Ghogha Road"],
      "Jamnagar": ["All", "Digjam Circle", "Patel Colony", "Panchavati", "Gulabnagar"],
    }
  },
  "Tamil Nadu": {
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thanjavur", "Dindigul", "Kanchipuram", "Tiruppur", "Cuddalore", "Thoothukudi", "Nagercoil (Kanyakumari)", "Dharmapuri", "Krishnagiri", "Namakkal", "Nilgiris", "Karur", "Nagapattinam", "Pudukkottai", "Ramanathapuram", "Sivaganga", "Theni", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Viluppuram", "Virudhunagar", "Ariyalur", "Perambalur", "Ranipet", "Tirupattur", "Tenkasi", "Chengalpattu", "Kallakurichi", "Mayiladuthurai"],
    cities: {
      "Chennai": ["All", "T Nagar", "Adyar", "Anna Nagar", "Velachery", "Mylapore", "Guindy", "OMR", "Porur", "Tambaram", "Besant Nagar", "Kilpauk", "Nungambakkam"],
      "Coimbatore": ["All", "RS Puram", "Gandhipuram", "Peelamedu", "Saibaba Colony", "Saravanampatti", "Singanallur", "Ukkadam"],
      "Madurai": ["All", "KK Nagar", "Anna Nagar", "Simmakkal", "Tallakulam", "Mattuthavani", "Teppakulam"],
      "Tiruchirappalli": ["All", "Thillai Nagar", "Cantonment", "Srirangam", "K K Nagar", "Ponmalai"],
      "Salem": ["All", "Fairlands", "Hasthampatti", "Suramangalam", "Alagapuram", "Shevapet"],
      "Tiruppur": ["All", "Avinashi Road", "Dharapuram Road", "Palladam Road", "Rayapuram"],
    }
  },
  "Telangana": {
    districts: ["Hyderabad", "Medchal-Malkajgiri", "Rangareddy", "Warangal", "Hanamkonda", "Khammam", "Karimnagar", "Nizamabad", "Mahabubnagar", "Nalgonda", "Siddipet", "Suryapet", "Adilabad", "Bhadradri Kothagudem", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Kumuram Bheem Asifabad", "Mahabubabad", "Mancherial", "Medak", "Mulugu", "Nagarkurnool", "Narayanpet", "Nirmal", "Peddapalli", "Rajanna Sircilla", "Sangareddy", "Vikarabad", "Wanaparthy", "Yadadri Bhuvanagiri"],
    cities: {
      "Hyderabad": ["All", "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kukatpally", "Secunderabad", "Hitec City", "Begumpet", "Ameerpet", "Charminar", "Kondapur", "Dilsukhnagar"],
      "Medchal-Malkajgiri": ["All", "Malkajgiri", "Kompally", "Medchal", "Alwal", "Kukatpally", "Bowenpally"],
      "Rangareddy": ["All", "LB Nagar", "Shamshabad", "Rajendranagar", "Serilingampally", "Attapur", "Manikonda"],
      "Warangal": ["All", "Kazipet", "Hanamkonda", "Subedari", "Nayeem Nagar", "Pochamma Maidan"],
      "Karimnagar": ["All", "Collectorate Road", "Mukarrampura", "Kashmirgadda", "Vidyanagar"],
    }
  },
  "Kerala": {
    districts: ["Thiruvananthapuram", "Ernakulam", "Kozhikode", "Thrissur", "Malappuram", "Kottayam", "Palakkad", "Kollam", "Alappuzha", "Kannur", "Pathanamthitta", "Idukki", "Wayanad", "Kasaragod"],
    cities: {
      "Thiruvananthapuram": ["All", "Pattom", "Palayam", "Kowdiar", "Kazhakoottam", "Technopark", "Vellayambalam", "Statue", "Sreekaryam"],
      "Ernakulam": ["All", "Kochi", "Edappally", "Kaloor", "Aluva", "Fort Kochi", "Kakkanad (Infopark)", "MG Road", "Palarivattom", "Panampilly Nagar"],
      "Kozhikode": ["All", "Mananchira", "Mavoor", "Chevayur", "Kallai", "Nadakkavu", "Medical College Area"],
      "Thrissur": ["All", "Swaraj Round", "Ayyanthole", "Ollur", "Puzhakkal", "Koorkenchery"],
      "Malappuram": ["All", "Manjeri", "Perinthalmanna", "Tirur", "Kottakkal"],
      "Kottayam": ["All", "Kanjikuzhy", "Nagampadam", "Changanassery", "Pala"],
    }
  },
  "West Bengal": {
    districts: ["Kolkata", "North 24 Parganas", "South 24 Parganas", "Howrah", "Hooghly", "Darjeeling", "Jalpaiguri", "Malda", "Murshidabad", "Nadia", "Purba Medinipur", "Paschim Medinipur", "Purba Bardhaman", "Paschim Bardhaman", "Birbhum", "Bankura", "Purulia", "Alipurduar", "Cooch Behar", "Dakshin Dinajpur", "Uttar Dinajpur", "Jhargram", "Kalimpong"],
    cities: {
      "Kolkata": ["All", "Salt Lake", "Park Street", "Ballygunge", "New Town", "Dum Dum", "Garia", "Behala", "Shyambazar", "Howrah Bridge Area", "Jadavpur", "Alipore"],
      "North 24 Parganas": ["All", "Barasat", "Barrackpore", "Bidhannagar", "Rajarhat", "Habra"],
      "South 24 Parganas": ["All", "Sonarpur", "Baruipur", "Jadavpur Border", "Diamond Harbour"],
      "Howrah": ["All", "Shibpur", "Santragachi", "Liluah", "Bally", "Salkia"],
      "Darjeeling": ["All", "Darjeeling Town", "Siliguri (Darjeeling part)", "Kurseong", "Mirik"],
      "Paschim Bardhaman": ["All", "Durgapur", "Asansol", "Raniganj", "Kulti"],
    }
  },
  "Rajasthan": {
    districts: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Pali", "Sri Ganganagar", "Chittorgarh", "Jhunjhunu", "Barmer", "Jaisalmer", "Nagaur", "Tonk", "Churu", "Dausa", "Sawai Madhopur", "Banswara", "Dungarpur", "Jhalawar", "Baran", "Bundi", "Hanumangarh", "Jalore", "Rajsamand", "Sirohi", "Pratapgarh", "Karauli", "Dholpur"],
    cities: {
      "Jaipur": ["All", "Malviya Nagar", "Vaishali Nagar", "C Scheme", "Mansarovar", "Raja Park", "Tonk Road", "Jagatpura", "Ajmer Road", "Bani Park"],
      "Jodhpur": ["All", "Shastri Nagar", "Ratanada", "Paota", "Sardarpura", "Chopasni Housing Board"],
      "Udaipur": ["All", "Fatehpura", "Hiran Magri", "Panchwati", "Shobhagpura", "Sukher"],
      "Kota": ["All", "Talwandi", "Vigyan Nagar", "Mahaveer Nagar", "Dadabari", "Kunhari"],
      "Ajmer": ["All", "Civil Lines", "Vaishali Nagar", "Panchsheel Nagar", "Adarsh Nagar"],
    }
  },
  "Andhra Pradesh": {
    districts: ["Visakhapatnam", "Vijayawada (NTR)", "Guntur", "Tirupati", "Nellore (SPSR Nellore)", "Kurnool", "Kakinada", "Anantapur", "Kadapa (YSR)", "Rajahmundry (East Godavari)", "Eluru", "Ongole (Prakasam)", "Srikakulam", "Vizianagaram", "Chittoor", "Bapatla", "Palnadu", "Nandyal", "Sri Sathya Sai", "Annamayya", "Konaseema", "West Godavari", "Krishna", "Parvathipuram Manyam", "Alluri Sitharama Raju"],
    cities: {
      "Visakhapatnam": ["All", "MVP Colony", "Gajuwaka", "Madhurawada", "Siripuram", "Dwaraka Nagar", "Rushikonda", "Seethammadhara"],
      "Vijayawada (NTR)": ["All", "Benz Circle", "MG Road", "Governorpet", "Bhavanipuram", "Gollapudi", "Gunadala"],
      "Guntur": ["All", "Lakshmipuram", "Brodipet", "Arundelpet", "Kothapet", "Pattabhipuram"],
      "Tirupati": ["All", "Renigunta", "Alipiri", "Bairagipatteda", "KT Road", "Tirumala Foot"],
      "Kurnool": ["All", "Nandyal Road", "Gayatri Estate", "Budhawarapet", "Joharapuram"],
    }
  },
  "Madhya Pradesh": {
    districts: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Panna", "Hoshangabad (Narmadapuram)", "Sehore", "Betul", "Seoni", "Datia"],
    cities: {
      "Indore": ["All", "Vijay Nagar", "Palasia", "MG Road", "Rajwada", "Bhawarkua", "Annapurna Road", "Super Corridor", "Rau"],
      "Bhopal": ["All", "MP Nagar", "Arera Colony", "Shahpura", "Kolar Road", "Hoshangabad Road", "New Market", "Govindpura"],
      "Jabalpur": ["All", "Civil Lines", "Wright Town", "Napier Town", "Vijay Nagar", "Adhartal"],
      "Gwalior": ["All", "City Centre", "Lashkar", "Morar", "Thatipur", "Hazira"],
      "Ujjain": ["All", "Freeganj", "Mahakal Area", "Nanaji Deshmukh Nagar", "Sethi Nagar"],
    }
  },
  "Bihar": {
    districts: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif (Nalanda)", "Arrah (Bhojpur)", "Begusarai", "Katihar", "Munger", "Chhapra (Saran)", "Sasaram (Rohtas)", "Dehri", "Bettiah (West Champaran)", "Motihari (East Champaran)", "Saharsa", "Samastipur", "Siwan", "Buxar", "Jehanabad", "Aurangabad", "Gopalganj", "Madhubani", "Nawada", "Kishanganj", "Sitamarhi", "Vaishali"],
    cities: {
      "Patna": ["All", "Boring Road", "Kankarbagh", "Bailey Road", "Patliputra Colony", "Rajendra Nagar", "Danapur", "Fraser Road", "Exhibition Road"],
      "Gaya": ["All", "Civil Lines", "Bodh Gaya", "Rampur", "Chand Chaura", "AP Colony"],
      "Muzaffarpur": ["All", "Mithanpura", "Brahampura", "Kalyani", "Aghoria Bazar", "Juran Chapra"],
      "Bhagalpur": ["All", "Tilkamanjhi", "Zero Mile", "Adampur", "Mirjanhat", "Nathnagar"],
    }
  },
  "Punjab": {
    districts: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "SAS Nagar (Mohali)", "Hoshiarpur", "Pathankot", "Moga", "Batala (Gurdaspur)", "Abohar (Fazilka)", "Malerkotla", "Khanna", "Phagwara (Kapurthala)", "Firozpur", "Muktsar", "Barnala", "Faridkot", "Tarn Taran", "Rupnagar", "Fatehgarh Sahib", "Shahid Bhagat Singh Nagar (Nawanshahr)", "Mansa"],
    cities: {
      "Ludhiana": ["All", "Model Town", "Civil Lines", "Sarabha Nagar", "Ferozepur Road", "BRS Nagar", "Dugri", "South City"],
      "Amritsar": ["All", "Mall Road", "Ranjit Avenue", "Lawrence Road", "Civil Lines", "Majitha Road", "Golden Temple Area"],
      "Jalandhar": ["All", "Model Town", "Civil Lines", "Cantt Road", "Urban Estate Phase 1", "Urban Estate Phase 2", "Rama Mandi"],
      "SAS Nagar (Mohali)": ["All", "Phase 3B2", "Phase 7", "Phase 5", "Sector 70", "Sector 82", "Aerocity"],
    }
  },
  "Haryana": {
    districts: ["Gurugram (Gurgaon)", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh (Jhajjar)", "Jind", "Thanesar (Kurukshetra)", "Kaithal", "Rewari", "Palwal", "Fatehabad", "Mahendragarh", "Nuh", "Charkhi Dadri"],
    cities: {
      "Gurugram (Gurgaon)": ["All", "Cyber City", "Golf Course Road", "DLF Phase 1-5", "Sohna Road", "Sector 29", "Sector 56", "Sector 14", "Palam Vihar", "MG Road"],
      "Faridabad": ["All", "Sector 15", "Sector 16", "Greenfield Colony", "NIT 1-5", "Neharpar (Greater Faridabad)", "Surajkund"],
      "Panchkula": ["All", "Sector 7", "Sector 8", "Sector 20", "MDC Sector 4", "Sector 12A"],
      "Panipat": ["All", "Model Town", "Sector 11-12", "GT Road", "Ansals City", "Hali Park Area"],
      "Karnal": ["All", "Model Town", "Sector 13", "Sector 14", "Mall Road", "Kunjpura Road"],
    }
  },
  "Odisha": {
    districts: ["Khurda (Bhubaneswar)", "Cuttack", "Ganjam (Berhampur)", "Sundargarh (Rourkela)", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada (Mayurbhanj)", "Angul", "Jharsuguda", "Jajpur", "Bargarh", "Rayagada", "Bolangir", "Kendrapara", "Dhenkanal", "Jagatsinghpur", "Koraput", "Nabarangpur", "Gajapati", "Kandhamal", "Nayagarh", "Kalahandi", "Malkangiri", "Nuapada", "Sonepur", "Deogarh", "Boudh"],
    cities: {
      "Khurda (Bhubaneswar)": ["All", "Saheed Nagar", "Nayapalli", "Chandrasekharpur", "Patia", "Khandagiri", "Jayadev Vihar", "Old Town", "Infocity"],
      "Cuttack": ["All", "Badambadi", "CDA Sector 1-10", "Link Road", "Cantonment", "Choudwar", "Bidanasi"],
      "Ganjam (Berhampur)": ["All", "Gosani Nuagaon", "Gandhi Nagar", "Engineering School Road", "Bhabha Nagar"],
      "Sundargarh (Rourkela)": ["All", "Sector 1-20", "Civil Township", "Uditnagar", "Panposh", "Chhend Colony"],
      "Puri": ["All", "Grand Road", "VIP Road", "Sea Beach Road", "Baliapanda", "Talabania"],
    }
  },
  "Assam": {
    districts: ["Kamrup Metropolitan (Guwahati)", "Dibrugarh", "Silchar (Cachar)", "Jorhat", "Nagaon", "Tinsukia", "Tezpur (Sonitpur)", "Bongaigaon", "Karimganj", "Sivasagar", "Golaghat", "Dhubri", "Barpeta", "Hailakandi", "Darrang", "Lakhimpur", "Morigaon", "Goalpara", "Nalbari", "Kokrajhar", "Baksa", "Chirang", "Udalguri", "Dima Hasao", "Karbi Anglong", "Biswanath", "Charaideo", "Hojai", "Majuli", "South Salmara-Mankachar", "West Karbi Anglong", "Bajali", "Tamulpur"],
    cities: {
      "Kamrup Metropolitan (Guwahati)": ["All", "GS Road", "Dispur", "Paltan Bazaar", "Zoo Road", "Beltola", "Khanapara", "Six Mile", "Panbazar", "Jalukbari", "Ganeshguri"],
      "Dibrugarh": ["All", "Amolapatty", "Graham Bazar", "Chowkidinghee", "Khalihamari", "Jalan Nagar"],
      "Silchar (Cachar)": ["All", "Tarapur", "Ambicapatty", "Hospital Road", "Rangirkhari", "Link Road"],
      "Jorhat": ["All", "Gar-Ali", "AT Road", "Jail Road", "Kenduguri", "Na-Ali"],
    }
  },
  "Jammu & Kashmir": {
    districts: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Pulwama", "Kupwara", "Budgam", "Kulgam", "Rajouri", "Poonch", "Samba", "Bandipora", "Ganderbal", "Reasi", "Ramban", "Kishtwar", "Doda", "Shopian"],
    cities: {
      "Srinagar": ["All", "Lal Chowk", "Rajbagh", "Karan Nagar", "Dalgate", "Bemina", "Hazratbal", "Hyderpora", "Sanat Nagar"],
      "Jammu": ["All", "Gandhi Nagar", "Trikuta Nagar", "Channi Himmat", "Bari Brahmana", "Bakshi Nagar", "Janipur", "Talab Tillo"],
      "Anantnag": ["All", "KP Road", "Ashajipora", "Nai Basti", "Khanabal"],
    }
  },
  "Goa": {
    districts: ["North Goa", "South Goa"],
    cities: {
      "North Goa": ["All", "Panaji", "Mapusa", "Candolim", "Calangute", "Porvorim", "Bicholim", "Pernem", "Old Goa"],
      "South Goa": ["All", "Margao", "Vasco da Gama", "Ponda", "Curchorem", "Fatorda", "Colva", "Benaulim"],
    }
  },
  "Uttarakhand": {
    districts: ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Rishikesh (Dehradun part)", "Roorkee (Haridwar part)", "Haldwani (Nainital part)", "Almora", "Pauri Garhwal", "Tehri Garhwal", "Pithoragarh", "Chamoli", "Uttarkashi", "Rudraprayag", "Champawat", "Bageshwar"],
    cities: {
      "Dehradun": ["All", "Rajpur Road", "Chakrata Road", "Sahastradhara Road", "Ballupur", "Dharampur", "Vasant Vihar", "Clement Town", "Prem Nagar"],
      "Haridwar": ["All", "Ranipur", "Jwalapur", "Kankhal", "Shivalik Nagar", "BHEL Township", "Har Ki Pauri"],
      "Nainital": ["All", "Haldwani", "Mall Road", "Kathgodam", "Tallital", "Mallital", "Bhowali"],
    }
  },
  "Himachal Pradesh": {
    districts: ["Shimla", "Kangra (Dharamshala)", "Mandi", "Solan", "Kullu", "Sirmaur", "Una", "Hamirpur", "Bilaspur", "Chamba", "Kinnaur", "Lahaul and Spiti"],
    cities: {
      "Shimla": ["All", "The Mall", "Sanjauli", "Chotta Shimla", "Kasumpti", "New Shimla", "Jakhoo", "Summer Hill"],
      "Kangra (Dharamshala)": ["All", "Dharamshala Main", "McLeod Ganj", "Kangra Town", "Palampur", "Nagrota Bagwan"],
      "Solan": ["All", "Mall Road", "Kandaghat", "Baddi", "Barog", "Saproon"],
    }
  },
  "Jharkhand": {
    districts: ["Ranchi", "East Singhbhum (Jamshedpur)", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Palamu", "West Singhbhum", "Dumka", "Godda", "Sahebganj", "Koderma", "Chatra", "Gumla", "Lohardaga", "Pakur", "Latehar", "Seraikela Kharsawan", "Garhwa", "Khunti", "Jamtara", "Simdega"],
    cities: {
      "Ranchi": ["All", "Doranda", "Hinoo", "Morabadi", "Harmu Housing Colony", "Lalpur", "Bariatu", "Ashok Nagar", "Kanke"],
      "East Singhbhum (Jamshedpur)": ["All", "Bistupur", "Sakchi", "Kadma", "Sonari", "Telco Colony", "Baridih", "Mango"],
      "Dhanbad": ["All", "Bank More", "Saraidhela", "Hirapur", "Koyla Nagar", "Jharia", "Katras"],
    }
  },
  "Chhattisgarh": {
    districts: ["Raipur", "Durg (Bhilai)", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur (Bastar)", "Ambikapur (Surguja)", "Dhamtari", "Mahasamund", "Janjgir-Champa", "Kanker", "Kawardha (Kabirdham)", "Balod", "Bemetara", "Baloda Bazar", "Gariaband", "Mungeli", "Surajpur", "Balrampur", "Kondagaon", "Sukma", "Bijapur", "Dantewada", "Narayanpur", "Koriya", "Gaurela-Pendra-Marwahi", "Khairagarh-Chhuikhadan-Gandai", "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Sakti", "Sarangarh-Bilaigarh"],
    cities: {
      "Raipur": ["All", "Pandri", "Shankar Nagar", "Civil Lines", "Samta Colony", "Tatibandh", "Telibandha", "VIP Road", "Naya Raipur"],
      "Durg (Bhilai)": ["All", "Sector 1-10", "Nehru Nagar", "Civic Center", "Supela", "Smriti Nagar", "Durg City"],
      "Bilaspur": ["All", "Vyapar Vihar", "Civil Lines", "Rajkishore Nagar", "Torwa", "Mangla", "Sirgitti"],
    }
  },
  "Chandigarh": {
    districts: ["Chandigarh"],
    cities: {
      "Chandigarh": ["All", "Sector 17 (City Centre)", "Sector 35", "Sector 22", "Sector 8-9", "Sector 43", "Sector 26", "Manimajra", "IT Park", "Industrial Area Phase 1-2"],
    }
  },
  "Puducherry": {
    districts: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    cities: {
      "Puducherry": ["All", "White Town", "Heritage Town", "Lawspet", "Muthialpet", "Reddiarpalayam", "Villiyanur", "Ariyankuppam"],
      "Karaikal": ["All", "Karaikal Town", "Neravy", "Nedungadu", "Kottucherry"],
    }
  },
  "Tripura": {
    districts: ["West Tripura (Agartala)", "Gomati", "South Tripura", "North Tripura", "Dhalai", "Unakoti", "Khowai", "Sepahijala"],
    cities: {
      "West Tripura (Agartala)": ["All", "Banamalipur", "Radhanagar", "Krishnanagar", "Dhaleswar", "Kunjaban", "Indranagar"],
    }
  },
  "Meghalaya": {
    districts: ["East Khasi Hills (Shillong)", "West Garo Hills (Tura)", "West Khasi Hills", "Ri Bhoi", "Jaintia Hills", "South Garo Hills", "East Garo Hills"],
    cities: {
      "East Khasi Hills (Shillong)": ["All", "Police Bazar", "Laban", "Laitumkhrah", "Mawlai", "Nongthymmai", "Risa Colony"],
    }
  },
  "Manipur": {
    districts: ["Imphal West", "Imphal East", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Senapati", "Ukhrul"],
    cities: {
      "Imphal West": ["All", "Thangal Bazar", "Paona Bazar", "Uripok", "Sagolband", "Lamphelpat", "Lalambung"],
    }
  },
  "Nagaland": {
    districts: ["Dimapur", "Kohima", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Phek", "Peren", "Longleng", "Kiphire", "Chumoukedima", "Niuland", "Tseminyu", "Shamator"],
    cities: {
      "Dimapur": ["All", "City Centre", "Purana Bazar", "Padampukhuri", "Duncan Bosti", "Supermarket Area"],
      "Kohima": ["All", "Main Town", "High School Colony", "Razhoo Point", "PR Hill", "Midland"],
    }
  },
  "Sikkim": {
    districts: ["East Sikkim (Gangtok)", "West Sikkim (Gyalshing)", "North Sikkim (Mangan)", "South Sikkim (Namchi)", "Pakyong", "Soreng"],
    cities: {
      "East Sikkim (Gangtok)": ["All", "MG Marg", "Deorali", "Tadong", "Development Area", "Ranipool", "Burtuk"],
    }
  },
  "Mizoram": {
    districts: ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip", "Mamit", "Lawngtlai", "Siaha", "Saitual", "Khawzawl", "Hnahthial"],
    cities: {
      "Aizawl": ["All", "Zarkawt", "Bawngkawn", "Khatla", "Chanmari", "Mission Veng", "Dawrpui", "Kulambang"],
    }
  },
  "Arunachal Pradesh": {
    districts: ["Papum Pare (Itanagar)", "Changlang", "West Kameng", "East Siang", "Tirap", "Lohit", "Upper Subansiri", "West Siang", "Tawang"],
    cities: {
      "Papum Pare (Itanagar)": ["All", "Ganga Market", "Naharlagun", "Niti Vihar", "Bank Tinali", "E-Sector", "Chandranagar"],
    }
  },
  "Ladakh": {
    districts: ["Leh", "Kargil"],
    cities: {
      "Leh": ["All", "Main Bazaar", "Changspa", "Choglamsar", "Skalzangling", "Sankar"],
      "Kargil": ["All", "Main Market", "Baroo", "Biamathang", "Poyen"],
    }
  },
  "Andaman and Nicobar Islands": {
    districts: ["South Andaman (Port Blair)", "North and Middle Andaman", "Nicobar"],
    cities: {
      "South Andaman (Port Blair)": ["All", "Aberdeen Bazaar", "Junglighat", "Garacharma", "Dollygunj", "Haddo", "Chatham"],
    }
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    districts: ["Daman", "Diu", "Dadra and Nagar Haveli (Silvassa)"],
    cities: {
      "Daman": ["All", "Nani Daman", "Moti Daman", "Devka Beach Road", "Dabhel"],
      "Diu": ["All", "Diu Town", "Ghoghla", "Nagoa", "Fudam"],
      "Dadra and Nagar Haveli (Silvassa)": ["All", "Silvassa Town", "Amli", "Naroli", "Khanvel"],
    }
  },
  "Lakshadweep": {
    districts: ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott"],
    cities: {
      "Kavaratti": ["All", "Kavaratti Main", "Admin Area", "Harbour View"],
    }
  }
};
