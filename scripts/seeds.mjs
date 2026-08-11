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
];
