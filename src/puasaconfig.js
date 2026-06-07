// Konfigurasi jadwal puasa
const jadwalPuasa = {
    Sahur: '04:00',
    Imsak: '04:50',
    Berbuka: '18:28'
  };
  
  const pesansahur = [
    '🌙 Bangun sahur! Jangan lupa niat puasa hari ini ya! 🍽️',
    '📢 Waktunya sahur! Semoga puasanya lancar dan penuh berkah! 🤲',
    '⏳ Sahur sebentar lagi habis, ayo segera makan sebelum waktu imsak tiba!',
    '🥣 Nikmati sahur dengan makanan bergizi agar kuat berpuasa seharian!',
    '🌟 Sahur adalah berkah! Yuk, jangan sampai terlewat!'
  ];
  
  const pesanimsak = [
    '⏳ Imsak tiba! Waktunya berhenti makan dan bersiap untuk puasa! 🌙',
    '📢 Perhatian! Sebentar lagi subuh, segera akhiri sahurmu! 🕰️',
    '🕌 Waktu imsak sudah dekat, jangan sampai terlambat!',
    '⚠️ Imsak bukan berarti adzan subuh, tapi waktunya bersiap untuk puasa!',
    '🍽️ Cepat, cepat! Waktu sahur hampir habis, beberapa menit lagi imsak!'
  ];
  
  const pesanmaghrib = [
    '🌅 Alhamdulillah! Waktunya berbuka puasa! Selamat menikmati hidangan! 🍽️',
    '🕌 Adzan Maghrib telah berkumandang! Nikmati hidangan berbuka dengan penuh syukur!',
    '🥤 Segeralah berbuka dengan yang manis, sebagaimana sunnah Rasulullah ﷺ!',
    '🍽️ Selamat berbuka! Semoga puasamu hari ini diterima oleh Allah SWT!',
    '⏳ Waktunya berbuka! Nikmati hidanganmu dengan penuh kesyukuran!'
  ];
  
  const haditsSahur = [
    '📖 Rasulullah ﷺ bersabda: _"Bersahurlah kalian, karena dalam sahur itu terdapat keberkahan."_ (HR. Bukhari & Muslim)',
    '📖 Nabi ﷺ bersabda: _"Sahur itu makanan yang penuh berkah, maka janganlah kalian meninggalkannya walaupun hanya dengan seteguk air."_ (HR. Ahmad)',
    '📖 Dari Anas bin Malik, Rasulullah ﷺ bersabda: _"Makan sahurlah kalian karena sesungguhnya di dalam sahur itu ada berkah."_ (HR. Bukhari & Muslim)',
    '📖 Rasulullah ﷺ bersabda: _"Sesungguhnya Allah dan para malaikat-Nya bershalawat kepada orang-orang yang makan sahur."_ (HR. Ibnu Hibban)'
  ];
  
  const haditsImsak = [
    '📖 Rasulullah ﷺ bersabda: _"Umatku akan selalu berada dalam kebaikan selama mereka menyegerakan berbuka dan mengakhirkan sahur."_ (HR. Ahmad)',
    '📖 Dari Abu Hurairah radhiyallahu ‘anhu, Nabi ﷺ bersabda: _"Puasa itu adalah perisai. Maka janganlah berkata kotor dan jangan berteriak-teriak."_ (HR. Bukhari & Muslim)',
    '📖 Nabi ﷺ bersabda: _"Barang siapa yang tidak meninggalkan perkataan dusta dan perbuatan keji, maka Allah tidak butuh ia meninggalkan makan dan minumnya."_ (HR. Bukhari)',
    '📖 Rasulullah ﷺ bersabda: _"Setiap amal anak Adam dilipatgandakan kebaikannya sepuluh hingga tujuh ratus kali lipat, kecuali puasa. Sesungguhnya puasa itu untuk-Ku dan Aku sendiri yang akan membalasnya."_ (HR. Bukhari & Muslim)'
  ];
  
  const haditsMaghrib = [
    '📖 Rasulullah ﷺ bersabda: _"Orang yang berpuasa memiliki dua kebahagiaan, yaitu ketika berbuka dan ketika bertemu dengan Rabb-nya."_ (HR. Bukhari & Muslim)',
    '📖 Dari Anas bin Malik, Nabi ﷺ bersabda: _"Barang siapa yang memberi buka orang yang berpuasa, maka baginya pahala seperti orang yang berpuasa tanpa mengurangi pahala orang yang berpuasa sedikit pun."_ (HR. Tirmidzi)',
    '📖 Rasulullah ﷺ bersabda: _"Sesungguhnya puasa itu hanya bagi-Ku, dan Aku sendiri yang akan membalasnya."_ (HR. Muslim)',
    '📖 Dari Salman Al-Farisi, Rasulullah ﷺ bersabda: _"Barang siapa yang memberi makan orang yang berpuasa saat berbuka, maka dosanya diampuni dan ia dibebaskan dari api neraka."_ (HR. Ibnu Khuzaimah)'
  ];
  
  // Ekspor semua konstanta
  module.exports = {
    jadwalPuasa,
    pesansahur,
    pesanimsak,
    pesanmaghrib,
    haditsSahur,
    haditsImsak,
    haditsMaghrib
  };