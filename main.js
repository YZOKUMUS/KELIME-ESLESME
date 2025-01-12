document.addEventListener("DOMContentLoaded", async () => {
  let kelimeListesi = [];
  let currentGroupIndex = 0;
  const groupSize = 8;
  let score = 0;

  const oyunAlani = document.getElementById("oyun-alani");
  const prevButton = document.getElementById("onceki-grup");
  const nextButton = document.getElementById("sonraki-grup");
  const scoreDisplay = document.getElementById("score");

  // JSON dosyasını yükle
  try {
    const response = await fetch("assets/data.json");
    if (!response.ok) throw new Error("JSON dosyası yüklenemedi.");
    const data = await response.json();
    kelimeListesi = data.map(({ arabic_word, turkish_meaning, sound_url }) => ({
      arabic: arabic_word,
      turkish: turkish_meaning,
      soundUrl: sound_url,
    }));

    // Veriyi karıştır
    shuffleArray(kelimeListesi);
    renderGroup();
  } catch (error) {
    console.error("JSON yükleme hatası:", error);
    return;
  }

  // Önceki ve sonraki grup butonları
  prevButton.addEventListener("click", () => {
    currentGroupIndex--;
    renderGroup();
  });

  nextButton.addEventListener("click", () => {
    currentGroupIndex++;
    renderGroup();
  });

  function addDropEvents(element) {
    element.addEventListener("dragover", (e) => e.preventDefault());
    element.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedArabic = e.dataTransfer.getData("text/plain");
      const targetArabic = element.dataset.arabic;
  
      if (draggedArabic === targetArabic) {
        element.classList.add("dogru");
        const correctCard = document.querySelector(`[data-arabic="${draggedArabic}"]`);
        correctCard.classList.add("dogru");
  
        score += 10;
        scoreDisplay.textContent = score;
  
        element.setAttribute("draggable", "false");
        correctCard.setAttribute("draggable", "false");
  
        playArabicAudio(draggedArabic);
      } else {
        element.classList.add("yanlis");
        setTimeout(() => element.classList.remove("yanlis"), 500);
  
        score -= 5;
        scoreDisplay.textContent = score;
      }
    });
  }
  

  // Grup render etme fonksiyonu
  function renderGroup() {
    oyunAlani.innerHTML = "";
    const start = currentGroupIndex * groupSize;
    const group = kelimeListesi.slice(start, start + groupSize);

    if (!group.length) return;

    const kelimeGrubu = document.createElement("div");
    kelimeGrubu.classList.add("kelime-grubu");

    // Arapça ve Türkçe kelimeleri karıştır
    const arabicSutun = createColumn(group, "arabic", true);
    const turkishSutun = createColumn(shuffleArray(group), "turkish", false);

    kelimeGrubu.append(arabicSutun, turkishSutun);
    oyunAlani.appendChild(kelimeGrubu);

    prevButton.disabled = currentGroupIndex === 0;
    nextButton.disabled = start + groupSize >= kelimeListesi.length;
  }

  // Kolonları oluşturma fonksiyonu
  function createColumn(data, key, isArabic) {
    const sutun = document.createElement("div");
    sutun.classList.add("sutun");

    data.forEach((item) => {
      const element = document.createElement("div");
      element.classList.add(isArabic ? "kart" : "hedef-alan");
      element.textContent = item[key];
      element.dataset.arabic = item.arabic;

      if (isArabic) {
        element.addEventListener("click", () => handleArabicClick(item));
      } else {
        element.addEventListener("click", () => handleTurkishClick(element));
      }

      // Mobil cihazlar için dokunmatik olayları ekleme
      element.addEventListener("touchstart", (e) => e.preventDefault()); // Touch start prevent
      sutun.appendChild(element);
    });

    return sutun;
  }

  // Arapça kelime tıklama işlevi (sadece sound_url ile sesli okuma)
  let selectedArabic = null;

  function handleArabicClick(item) {
    selectedArabic = item.arabic;
    const audio = new Audio(item.soundUrl); // Sound URL üzerinden ses dosyasını oynat
    audio.play();
  }

  // Türkçe kelime tıklama işlevi
  function handleTurkishClick(element) {
    if (selectedArabic) {
      const selectedTurkish = element.dataset.arabic;
      if (selectedArabic === selectedTurkish) {
        element.classList.add("dogru");
        const correctCard = document.querySelector(`[data-arabic="${selectedArabic}"]`);
        correctCard.classList.add("dogru");

        score += 10;
        scoreDisplay.textContent = score;

        selectedArabic = null;
      } else {
        element.classList.add("yanlis");
        setTimeout(() => element.classList.remove("yanlis"), 500);

        score -= 5;
        scoreDisplay.textContent = score;

        selectedArabic = null;
      }
    }
  }

  // Array karıştırma fonksiyonu (Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
});
