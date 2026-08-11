/* ─────────────────────────────────────────────────────────────
   DJ Wala — the set

   `name`   what the site displays. Hand-written on purpose: a channel's
            upload title is marketing copy that happens to contain the
            song name, and no regex turns one into the other.
   `q`      what we type into YouTube search.
   `artist` overrides iTunes, for remixes whose original is what iTunes
            actually indexes.
   `id`     pins one video outright.
   `bpm`    drives the strobe pulse only. A feel value; ±5 is invisible.

   Note on what survives: the big labels (T-Series, Zee Music, Sony India)
   switch off embedding on their official uploads, so those IDs load and
   then refuse to play anywhere but youtube.com. Two thirds of an earlier
   version of this list was silent for exactly that reason. Nothing here
   is trusted until scripts/check-embeds.mjs has watched it cue in a real
   player — see README.
   ───────────────────────────────────────────────────────────── */

export const SEEDS = [
  /* ── पंजाबी · Punjabi Pop ─────────────────────────────────── */
  { name: 'Lamberghini', q: 'Lamberghini Doorbeen Ragini official video', rotation: 'punjabi', bpm: 100 },
  { name: 'Brown Munde', q: 'Brown Munde AP Dhillon Gurinder Gill official', rotation: 'punjabi', bpm: 95 },
  { name: '5 Taara', q: '5 Taara Diljit Dosanjh official video', rotation: 'punjabi', bpm: 100 },
  { name: 'Do You Know', q: 'Do You Know Diljit Dosanjh official video', rotation: 'punjabi', bpm: 98 },
  { name: 'Laembadgini', q: 'Laembadgini Diljit Dosanjh official video', rotation: 'punjabi', bpm: 102 },
  { name: 'High Rated Gabru', q: 'High Rated Gabru Guru Randhawa official video', rotation: 'punjabi', bpm: 100 },
  { name: 'Lahore', q: 'Lahore Guru Randhawa official video', rotation: 'punjabi', bpm: 92 },
  { name: 'Suit Suit', q: 'Suit Suit Guru Randhawa Arjun Patiala official', rotation: 'punjabi', bpm: 96 },
  { name: 'Softly', q: 'Softly Karan Aujla official video', rotation: 'punjabi', bpm: 96 },
  { name: 'Wavy', q: 'Wavy Karan Aujla Ikky official video', rotation: 'punjabi', bpm: 98 },
  { name: 'Angreji Beat', q: 'Angreji Beat Yo Yo Honey Singh Gippy Grewal', rotation: 'punjabi', bpm: 100 },
  { name: 'Patiala Peg', q: 'Patiala Peg Diljit Dosanjh official video', rotation: 'punjabi', bpm: 100 },
  { name: 'Naah', q: 'Naah Harrdy Sandhu Nora Fatehi official video', rotation: 'punjabi', bpm: 96 },
  { name: 'Kya Baat Ay', q: 'Kya Baat Ay Harrdy Sandhu official video', rotation: 'punjabi', bpm: 100 },
  { name: 'Jugnu', q: 'Jugnu Badshah official music video', rotation: 'punjabi', bpm: 98 },

  /* ── बॉलीवुड फ्लोर · Bollywood Floor ──────────────────────── */
  { name: 'Kala Chashma', q: 'Kala Chashma Baar Baar Dekho full video song', rotation: 'bolly', bpm: 105 },
  { name: 'Nachde Ne Saare', q: 'Nachde Ne Saare Baar Baar Dekho full video song', rotation: 'bolly', bpm: 102 },
  { name: 'Badtameez Dil', q: 'Badtameez Dil Yeh Jawaani Hai Deewani full song', rotation: 'bolly', bpm: 120 },
  { name: 'Balam Pichkari', q: 'Balam Pichkari Yeh Jawaani Hai Deewani full song', rotation: 'bolly', bpm: 130 },
  { name: 'Gallan Goodiyaan', q: 'Gallan Goodiyaan Dil Dhadakne Do full video song', rotation: 'bolly', bpm: 110 },
  { name: 'Malhari', q: 'Malhari Bajirao Mastani full video song', rotation: 'bolly', bpm: 128 },
  { name: 'Tune Maari Entriyaan', q: 'Tune Maari Entriyaan Gunday full video song', rotation: 'bolly', bpm: 118 },
  { name: 'London Thumakda', q: 'London Thumakda Queen full video song', rotation: 'bolly', bpm: 140 },
  { name: 'Chittiyaan Kalaiyaan', q: 'Chittiyaan Kalaiyaan Roy full video song', rotation: 'bolly', bpm: 100 },
  { name: 'Abhi Toh Party Shuru Hui Hai', q: 'Abhi Toh Party Shuru Hui Hai Khoobsurat full song', rotation: 'bolly', bpm: 104 },
  { name: 'Saturday Saturday', q: 'Saturday Saturday Humpty Sharma Ki Dulhania full song', rotation: 'bolly', bpm: 100 },
  { name: 'Desi Girl', q: 'Desi Girl Dostana full video song', rotation: 'bolly', bpm: 108 },
  { name: 'Party All Night', q: 'Party All Night Boss Yo Yo Honey Singh full song', rotation: 'bolly', bpm: 100 },
  { name: 'Aankh Marey', q: 'Aankh Marey Simmba full video song', rotation: 'bolly', bpm: 112 },
  { name: 'Naach Meri Rani', q: 'Naach Meri Rani Guru Randhawa Nora Fatehi', rotation: 'bolly', bpm: 100 },
  { name: 'Dhoom Machale', q: 'Dhoom Machale Dhoom full video song', rotation: 'bolly', bpm: 120 },

  /* ── बारात · Baraat Mode ──────────────────────────────────── */
  { name: 'Dilbar', q: 'Dilbar Satyameva Jayate full video song Nora Fatehi', rotation: 'baraat', bpm: 104 },
  { name: 'Mundian To Bach Ke', q: 'Mundian To Bach Ke Panjabi MC official', rotation: 'baraat', bpm: 105 },
  { name: 'Nagada Sang Dhol', q: 'Nagada Sang Dhol Goliyon Ki Raasleela Ram Leela', rotation: 'baraat', bpm: 130 },
  { name: 'Bom Diggy Diggy', q: 'Bom Diggy Diggy Zack Knight Jasmin Walia', rotation: 'baraat', bpm: 100 },
  { name: 'Morni Banke', q: 'Morni Banke Badhaai Ho Guru Randhawa full song', rotation: 'baraat', bpm: 98 },
  { name: 'Kamariya', q: 'Kamariya Stree full video song Nora Fatehi', rotation: 'baraat', bpm: 108 },
  { name: 'Aaj Ki Party', q: 'Aaj Ki Party Bajrangi Bhaijaan full video song', rotation: 'baraat', bpm: 112 },
  { name: 'Gud Naal Ishq Mitha', q: 'Gud Naal Ishq Mitha Bhangra Paa Le full song', rotation: 'baraat', bpm: 100 },
  { name: 'Shava Shava', q: 'Shava Shava Kabhi Khushi Kabhie Gham full song', rotation: 'baraat', bpm: 120 },
  { name: 'Bole Chudiyan', q: 'Bole Chudiyan Kabhi Khushi Kabhie Gham full song', rotation: 'baraat', bpm: 128 },
  { name: 'Chogada', q: 'Chogada Loveyatri full video song Darshan Raval', rotation: 'baraat', bpm: 135 },
  { name: 'The Wakhra Song', q: 'Wakhra Swag Judgementall Hai Kya full song', rotation: 'baraat', bpm: 100 },

  /* ── रेट्रो · Retro Night ─────────────────────────────────── */
  // iTunes only knows the 1972 original, so the artist is pinned to the
  // remix act whose video this actually is.
  { name: 'Kaanta Laga', artist: 'DJ Doll', q: 'Kaanta Laga DJ Doll official video', rotation: 'retro', bpm: 100 },
  { name: 'Tunak Tunak Tun', q: 'Tunak Tunak Tun Daler Mehndi official video', rotation: 'retro', bpm: 130 },
  { name: 'Bolo Ta Ra Ra', q: 'Bolo Ta Ra Ra Daler Mehndi official video', rotation: 'retro', bpm: 128 },
  { name: "It's The Time To Disco", q: "It's The Time To Disco Kal Ho Naa Ho full song", rotation: 'retro', bpm: 125 },
  { name: 'Woh Ladki Hai Kahan', q: 'Woh Ladki Hai Kahan Dil Chahta Hai full song', rotation: 'retro', bpm: 118 },
  { name: 'Dard-E-Disco', q: 'Dard E Disco Om Shanti Om full video song', rotation: 'retro', bpm: 128 },
  { name: 'Deewangi Deewangi', q: 'Deewangi Deewangi Om Shanti Om full video song', rotation: 'retro', bpm: 132 },
  { name: "Where's The Party Tonight", q: "Where's The Party Tonight Kabhi Alvida Naa Kehna", rotation: 'retro', bpm: 128 },
  { name: 'Dus Bahane', q: 'Dus Bahane Dus full video song', rotation: 'retro', bpm: 130 },
  { name: 'Crazy Kiya Re', q: 'Crazy Kiya Re Dhoom 2 full video song', rotation: 'retro', bpm: 118 },
  { name: 'Jhoom Barabar Jhoom', q: 'Jhoom Barabar Jhoom title full video song', rotation: 'retro', bpm: 120 },
  // Slumdog's version is Rahman's; iTunes keeps matching the Telugu
  // original it was lifted from, so the artist is pinned.
  { name: 'Ringa Ringa', artist: 'A. R. Rahman', q: 'Ringa Ringa Slumdog Millionaire full song', rotation: 'retro', bpm: 128 },

  /* ── आफ्टर आवर्स · After Hours ────────────────────────────── */
  { name: 'Summer High', q: 'Summer High AP Dhillon official video', rotation: 'after', bpm: 90 },
  { name: 'Insane', q: 'Insane AP Dhillon Gurinder Gill official', rotation: 'after', bpm: 92 },
  { name: 'Tere Te', q: 'Tere Te AP Dhillon Gurinder Gill official', rotation: 'after', bpm: 90 },
  { name: 'Excuses', q: 'Excuses AP Dhillon Gurinder Gill official', rotation: 'after', bpm: 88 },
  { name: 'Cheques', q: 'Cheques Shubh official video', rotation: 'after', bpm: 92 },
  { name: 'Nain Ta Heere', q: 'Nain Ta Heere Guru Randhawa official video', rotation: 'after', bpm: 96 },
  { name: 'Bijlee Bijlee', q: 'Bijlee Bijlee Harrdy Sandhu official video', rotation: 'after', bpm: 94 },
  { name: '295', q: '295 Sidhu Moose Wala official video', rotation: 'after', bpm: 90 },
  { name: 'So High', q: 'So High Sidhu Moose Wala official video', rotation: 'after', bpm: 95 },
  { name: 'Same Beef', q: 'Same Beef Bohemia Sidhu Moose Wala official', rotation: 'after', bpm: 92 },
  { name: 'Illegal Weapon 2.0', q: 'Illegal Weapon 2.0 Street Dancer 3D full song', rotation: 'after', bpm: 100 },
  { name: 'Obsessed', q: 'Obsessed Riar Saab official video', rotation: 'after', bpm: 90 },

  /* ── More floor fillers ───────────────────────────────────── */
  { name: 'Proper Patola', q: 'Proper Patola Namaste England Badshah full song', rotation: 'punjabi', bpm: 100 },
  { name: 'Daru Badnaam', q: 'Daru Badnaam Kamal Kahlon Param Singh official', rotation: 'punjabi', bpm: 96 },
  { name: 'Yaar Bathere', q: 'Yaar Bathere Alfaaz Yo Yo Honey Singh', rotation: 'punjabi', bpm: 100 },
  { name: 'Lak 28 Kudi Da', q: 'Lak 28 Kudi Da Diljit Dosanjh Yo Yo Honey Singh', rotation: 'punjabi', bpm: 100 },
  { name: 'Dance Basanti', q: 'Dance Basanti Ungli full video song', rotation: 'bolly', bpm: 108 },
  { name: 'Dilliwaali Girlfriend', q: 'Dilliwaali Girlfriend Yeh Jawaani Hai Deewani', rotation: 'bolly', bpm: 130 },
  { name: 'Char Baj Gaye', q: 'Char Baj Gaye Hey Bro Yo Yo Honey Singh full song', rotation: 'bolly', bpm: 104 },
  { name: 'Lungi Dance', q: 'Lungi Dance Chennai Express full video song', rotation: 'bolly', bpm: 100 },
  { name: 'Kar Gayi Chull', q: 'Kar Gayi Chull Kapoor and Sons full video song', rotation: 'bolly', bpm: 100 },
  { name: 'Tamma Tamma Again', q: 'Tamma Tamma Again Badrinath Ki Dulhania', rotation: 'bolly', bpm: 128 },
  { name: 'Swag Se Swagat', q: 'Swag Se Swagat Tiger Zinda Hai full video song', rotation: 'bolly', bpm: 100 },
  { name: 'Ghungroo', q: 'Ghungroo War full video song Hrithik Roshan', rotation: 'bolly', bpm: 108 },
  { name: 'Garmi', q: 'Garmi Street Dancer 3D full video song Badshah', rotation: 'bolly', bpm: 104 },
  { name: 'Saami Saami', q: 'Saami Saami Pushpa full video song', rotation: 'bolly', bpm: 108 },
  { name: 'Oo Antava', q: 'Oo Antava Pushpa full video song Samantha', rotation: 'bolly', bpm: 110 },
  { name: 'Chaiyya Chaiyya', q: 'Chaiyya Chaiyya Dil Se full video song', rotation: 'retro', bpm: 120 },
  { name: 'Kajra Re', q: 'Kajra Re Bunty Aur Babli full video song', rotation: 'retro', bpm: 118 },
  { name: 'Beedi', q: 'Beedi Omkara full video song', rotation: 'retro', bpm: 122 },
  { name: 'Mauja Hi Mauja', q: 'Mauja Hi Mauja Jab We Met full video song', rotation: 'retro', bpm: 128 },
  { name: 'Pretty Woman', q: 'Pretty Woman Kal Ho Naa Ho full video song', rotation: 'retro', bpm: 122 },
  { name: 'Aaj Ki Raat', q: 'Aaj Ki Raat Don full video song', rotation: 'retro', bpm: 118 },
  { name: 'Sheila Ki Jawani', q: 'Sheila Ki Jawani Tees Maar Khan full video song', rotation: 'retro', bpm: 120 },
  { name: 'Munni Badnaam Hui', q: 'Munni Badnaam Hui Dabangg full video song', rotation: 'baraat', bpm: 128 },
  { name: 'Kudi Nu Nachne De', q: 'Kudi Nu Nachne De Angrezi Medium full song', rotation: 'baraat', bpm: 105 },
  { name: 'Nachan Farrate', q: 'Nachan Farrate All Is Well full video song', rotation: 'baraat', bpm: 118 },
  { name: 'Baby Ko Bass Pasand Hai', q: 'Baby Ko Bass Pasand Hai Sultan full video song', rotation: 'baraat', bpm: 104 },
  { name: 'Coka', q: 'Coka Sukh-E Muzical Doctorz official video', rotation: 'after', bpm: 94 },
  { name: 'Lets Nacho', q: 'Lets Nacho Kapoor and Sons full video song', rotation: 'after', bpm: 100 },
  { name: 'Baller', q: 'Baller Shubh official video', rotation: 'after', bpm: 92 },
  { name: 'Elevated', q: 'Elevated Shubh official video', rotation: 'after', bpm: 90 },
  { name: 'No Love', q: 'No Love Shubh official video', rotation: 'after', bpm: 92 },
  { name: 'Still Rollin', q: 'Still Rollin Shubh official video', rotation: 'after', bpm: 90 },

  /* ── हाई बीट · DJ-floor remixes and high-tempo Hindi ───────
     Remix and dance versions rather than the soundtrack cut: these are
     what a DJ actually drops, and they carry a four-on-the-floor kick the
     originals often do not. Mostly 90s/2000s, which is the era this set
     leans on hardest. */
  { name: 'Tu Cheez Badi Hai Mast', q: 'Tu Cheez Badi Hai Mast Mast Machine full song Neha Kakkar', rotation: 'retro', bpm: 105 },
  { name: 'The Humma Song', q: 'The Humma Song OK Jaanu full video Badshah', rotation: 'retro', bpm: 104 },
  { name: 'Laila Main Laila', q: 'Laila Main Laila Raees full video song Sunny Leone', rotation: 'retro', bpm: 108 },
  { name: 'Ek Do Teen', q: 'Ek Do Teen Baaghi 2 full video song Jacqueline', rotation: 'retro', bpm: 118 },
  { name: 'O Saki Saki', q: 'O Saki Saki Batla House full video song Nora Fatehi', rotation: 'bolly', bpm: 104 },
  { name: 'Urvashi', q: 'Urvashi Yo Yo Honey Singh Shahid Kapoor official', rotation: 'bolly', bpm: 100 },
  { name: 'Makhna', q: 'Makhna Drive full video song Sushant Singh Rajput', rotation: 'bolly', bpm: 100 },
  { name: 'Mungda', q: 'Mungda Total Dhamaal full video song Sonakshi Sinha', rotation: 'baraat', bpm: 118 },
  { name: 'Chamma Chamma', q: 'Chamma Chamma Fraud Saiyaan full video song Neha Kakkar', rotation: 'baraat', bpm: 120 },
  { name: 'Aashiq Banaya Aapne', q: 'Aashiq Banaya Aapne title full video song', rotation: 'retro', bpm: 100 },
  { name: 'Kabhi Aar Kabhi Paar', q: 'Kabhi Aar Kabhi Paar Aishwarya video song', rotation: 'retro', bpm: 120 },
  { name: 'Kaliyon Ka Chaman', q: 'Kaliyon Ka Chaman DJ Doll official video', rotation: 'retro', bpm: 104 },
  { name: 'Kaate Nahi Kat Te', q: 'Kaate Nahi Kat Te Mr India full song', rotation: 'retro', bpm: 100 },
  { name: 'Dil Le Gayi Kudi', q: 'Dil Le Gayi Kudi Gujarat Di Jodi No 1 full song', rotation: 'retro', bpm: 128 },
  { name: 'Nasha Nasha', q: 'Ishq Tera Tadpave Sukhbir official video', rotation: 'retro', bpm: 104 },
  { name: 'Chikni Chameli', q: 'Chikni Chameli Agneepath full video song Katrina', rotation: 'baraat', bpm: 130 },
  { name: 'Fevicol Se', q: 'Fevicol Se Dabangg 2 full video song Kareena', rotation: 'baraat', bpm: 120 },
  { name: 'Halkat Jawani', q: 'Halkat Jawani Heroine full video song Kareena', rotation: 'bolly', bpm: 122 },
  { name: 'Gandi Baat', q: 'Gandi Baat R Rajkumar full video song Shahid', rotation: 'bolly', bpm: 118 },
  { name: 'Lovely', q: 'Lovely Happy New Year full video song Deepika', rotation: 'bolly', bpm: 118 },
  { name: 'Tattad Tattad', q: 'Tattad Tattad Ram Leela full video song Ranveer', rotation: 'baraat', bpm: 128 },
  { name: 'Radha', q: 'Radha Student Of The Year full video song', rotation: 'bolly', bpm: 124 },
  { name: 'Dhating Naach', q: 'Dhating Naach Phata Poster Nikhla Hero full song', rotation: 'bolly', bpm: 120 },
  { name: 'Ooh La La', q: 'Ooh La La The Dirty Picture full video song Vidya', rotation: 'retro', bpm: 118 },
  { name: 'Party On My Mind', q: 'Party On My Mind Race 2 full video song', rotation: 'bolly', bpm: 126 },
  { name: 'Nashe Si Chadh Gayi', q: 'Nashe Si Chadh Gayi Befikre full video song', rotation: 'bolly', bpm: 108 },
  { name: 'High Heels Te Nachche', q: 'High Heels Te Nachche Ki Kamaal Hai full song', rotation: 'punjabi', bpm: 104 },
  { name: 'Manali Trance', q: 'Manali Trance The Shaukeens Yo Yo Honey Singh', rotation: 'after', bpm: 128 },
  { name: 'Blue Eyes', q: 'Blue Eyes Yo Yo Honey Singh official video', rotation: 'punjabi', bpm: 100 },
  { name: 'Love Dose', q: 'Love Dose Yo Yo Honey Singh Urvashi Rautela', rotation: 'punjabi', bpm: 100 },
  { name: 'Dope Shope', q: 'Dope Shope Yo Yo Honey Singh Deep Money', rotation: 'punjabi', bpm: 98 },
  { name: 'Brown Rang', q: 'Brown Rang Yo Yo Honey Singh official video', rotation: 'punjabi', bpm: 98 },
  { name: 'Baby Doll', q: 'Baby Doll Ragini MMS 2 full video song Sunny Leone', rotation: 'bolly', bpm: 108 },
  { name: 'Pinga', q: 'Pinga Bajirao Mastani full video song', rotation: 'baraat', bpm: 132 },
  { name: 'Sona Sona', q: 'Sona Sona Major Saab full video song', rotation: 'retro', bpm: 124 },
  { name: 'Rangeela Re', q: 'Rangeela Re Rangeela full video song Urmila', rotation: 'retro', bpm: 118 },
  { name: 'Mehboob Mere', q: 'Mehboob Mere Fiza full video song Sushmita Sen', rotation: 'retro', bpm: 122 },
  { name: 'Ankhiyon Se Goli Mare', q: 'Ankhiyon Se Goli Mare Dulhe Raja full song', rotation: 'retro', bpm: 128 },
  { name: 'What Jhumka', q: 'What Jhumka Rocky Aur Rani full video song', rotation: 'baraat', bpm: 124 },
  { name: 'Jhoome Jo Pathaan', q: 'Jhoome Jo Pathaan full video song Shah Rukh Khan', rotation: 'bolly', bpm: 108 },
  { name: 'Besharam Rang', q: 'Besharam Rang Pathaan full video song Deepika', rotation: 'bolly', bpm: 104 },
  { name: 'Kesariya Beats', q: 'Kudmayi Rocky Aur Rani full video song', rotation: 'baraat', bpm: 110 },
  { name: 'Zingaat', q: 'Zingaat Dhadak full video song Janhvi Ishaan', rotation: 'baraat', bpm: 138 },
  { name: 'Aila Re Aillaa', q: 'Aila Re Aillaa Sooryavanshi full video song', rotation: 'bolly', bpm: 118 },
  { name: 'Chhote Chhote Peg', q: 'Chhote Chhote Peg Sonu Ke Titu Ki Sweety full song', rotation: 'baraat', bpm: 104 },
  { name: 'Dil Chori', q: 'Dil Chori Sonu Ke Titu Ki Sweety full song Yo Yo Honey Singh', rotation: 'baraat', bpm: 100 },
  { name: 'Paisa Paisa', q: 'Paisa Yo Yo Honey Singh De De Pyaar De full song', rotation: 'punjabi', bpm: 100 },

  /* ── मिक्स · DJ sets ───────────────────────────────────────
     Whole sets rather than single tracks: forty minutes of continuous
     mixing, which is what actually plays in a club between the anthems.
     These live in their own rotation because the length rule that keeps
     jukeboxes out of the song list would throw every one of them away —
     see MIX_MAX_SECONDS in build-tracks.mjs. */
  // Pinned by hand and then rejected by the verifier: DJ NYK's uploads
  // return error 150, so this set plays on youtube.com and nowhere else.
  // Left here as a record, since the obvious fix — pin it harder — does
  // not work and someone will try it again otherwise.
  // { name: 'Bollywood Sunset Mix', artist: 'DJ NYK', id: 'vMpaSBYh5pA', q: 'DJ NYK Bollywood Sunset Mix Vernazza', rotation: 'mix', bpm: 104 },
  { name: 'Bollywood Party Mix', q: 'DJ NYK non stop bollywood party mix', rotation: 'mix', bpm: 108 },
  { name: 'Punjabi Mashup', q: 'DJ NYK punjabi mashup non stop', rotation: 'mix', bpm: 100 },
  { name: 'Bollywood Retro Mix', q: 'DJ NYK retro bollywood mix 90s', rotation: 'mix', bpm: 120 },
  { name: 'Desi Wedding Mix', q: 'DJ Chetas non stop bollywood wedding mix', rotation: 'mix', bpm: 118 },
  { name: 'Bollywood Dance Mashup', q: 'DJ Shadow Dubai bollywood mashup non stop', rotation: 'mix', bpm: 110 },
  { name: 'Old Is Gold Mix', q: 'non stop old hindi songs dj remix 90s mix', rotation: 'mix', bpm: 122 },
  { name: 'Bhangra Mix', q: 'non stop bhangra mix dj punjabi party', rotation: 'mix', bpm: 100 },
];
