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
    renderGroup();
  } catch (error) {
    console.error("JSON yükleme hatası:", error);
    return;
  }

  prevButton.addEventListener("click", () => {
    currentGroupIndex--;
    renderGroup();
  });

  nextButton.addEventListener("click", () => {
    currentGroupIndex++;
    renderGroup();
  });

  function renderGroup() {
    oyunAlani.innerHTML = "";
    const start = currentGroupIndex * groupSize;
    const group = kelimeListesi.slice(start, start + groupSize);

    if (!group.length) return;

    const kelimeGrubu = document.createElement("div");
    kelimeGrubu.classList.add("kelime-grubu");

    const arabicSutun = createColumn(group, "arabic", true);
    const turkishSutun = createColumn(shuffleArray(group), "turkish", false);

    kelimeGrubu.append(arabicSutun, turkishSutun);
    oyunAlani.appendChild(kelimeGrubu);

    prevButton.disabled = currentGroupIndex === 0;
    nextButton.disabled = start + groupSize >= kelimeListesi.length;
  }

  function createColumn(data, key, isDraggable) {
    const sutun = document.createElement("div");
    sutun.classList.add("sutun");

    data.forEach((item) => {
      const element = document.createElement("div");
      element.classList.add(isDraggable ? "kart" : "hedef-alan");
      element.textContent = item[key];
      element.dataset.arabic = item.arabic;

      if (isDraggable) addDragEvents(element);
      else addDropEvents(element);

      sutun.appendChild(element);
    });

    return sutun;
  }

  function addDragEvents(element) {
    element.setAttribute("draggable", "true");
    element.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", element.dataset.arabic);
      element.classList.add("surukleniyor");
    });
    element.addEventListener("dragend", () => element.classList.remove("surukleniyor"));
  }

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

  function playArabicAudio(word) {
    const kelime = kelimeListesi.find((item) => item.arabic === word);
    if (kelime && kelime.soundUrl) {
      const audio = new Audio(kelime.soundUrl);
      audio.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "ar-SA";
      speechSynthesis.speak(utterance);
    }
  }

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const oyunAlani = document.getElementById("oyun-alani");
  const kelimeGrubu = document.querySelector(".kelime-grubu");
  
  // Dinamik genişlik ayarları
  window.addEventListener("resize", () => {
    const maxCardWidth = Math.min(150, window.innerWidth / 5);
    document.querySelectorAll(".kart, .hedef-alan").forEach((element) => {
      element.style.maxWidth = `${maxCardWidth}px`;
    });
  });
});
