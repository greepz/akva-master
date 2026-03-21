const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const phoneInput = document.getElementById("phone");
const burgerButton = document.getElementById("burgerButton");
const mobileMenu = document.getElementById("mobileMenu");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const uploadInput = document.getElementById("attachments");
const uploadDropzone = document.getElementById("uploadDropzone");
const uploadList = document.getElementById("uploadList");

let selectedFiles = [];

function showToast(text) {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add("show");
  });

  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2600);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " КБ";
  return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
}

function renderFileList() {
  if (!uploadList) return;

  uploadList.innerHTML = "";

  selectedFiles.forEach(function (file) {
    const item = document.createElement("div");
    item.className = "upload-item";

    const name = document.createElement("span");
    name.textContent = file.name;

    const size = document.createElement("small");
    size.textContent = formatFileSize(file.size);

    item.appendChild(name);
    item.appendChild(size);
    uploadList.appendChild(item);
  });
}

function syncInputFiles(filesArray) {
  if (!uploadInput || typeof DataTransfer === "undefined") return;

  const dataTransfer = new DataTransfer();
  filesArray.forEach(function (file) {
    dataTransfer.items.add(file);
  });
  uploadInput.files = dataTransfer.files;
}

function addFiles(files) {
  const imageFiles = Array.from(files).filter(function (file) {
    return file.type.startsWith("image/");
  });

  if (!imageFiles.length) {
    showToast("Можно загрузить только изображения");
    return;
  }

  selectedFiles = selectedFiles.concat(imageFiles);
  syncInputFiles(selectedFiles);
  renderFileList();
}

if (uploadDropzone && uploadInput) {
  uploadDropzone.addEventListener("click", function () {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", function () {
    addFiles(uploadInput.files);
  });

  ["dragenter", "dragover"].forEach(function (eventName) {
    uploadDropzone.addEventListener(eventName, function (event) {
      event.preventDefault();
      uploadDropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach(function (eventName) {
    uploadDropzone.addEventListener(eventName, function (event) {
      event.preventDefault();
      uploadDropzone.classList.remove("is-dragover");
    });
  });

  uploadDropzone.addEventListener("drop", function (event) {
    addFiles(event.dataTransfer.files);
  });
}

if (burgerButton && mobileMenu) {
  burgerButton.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.toggle("open");
    burgerButton.classList.toggle("active", isOpen);
    burgerButton.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("open");
      burgerButton.classList.remove("active");
      burgerButton.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", function (event) {
    const isClickInsideMenu = mobileMenu.contains(event.target);
    const isClickOnBurger = burgerButton.contains(event.target);

    if (!isClickInsideMenu && !isClickOnBurger) {
      mobileMenu.classList.remove("open");
      burgerButton.classList.remove("active");
      burgerButton.setAttribute("aria-expanded", "false");
    }
  });
}

if (phoneInput) {
  phoneInput.addEventListener("input", function (e) {
    let digits = e.target.value.replace(/[^0-9]/g, "");

    if (digits.startsWith("8")) {
      digits = "7" + digits.slice(1);
    }

    if (digits.length > 0 && !digits.startsWith("7")) {
      digits = "7" + digits;
    }

    digits = digits.slice(0, 11);

    let formatted = "+7";

    if (digits.length > 1) {
      formatted += " (" + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
      formatted += ") " + digits.slice(4, 7);
    }
    if (digits.length >= 7) {
      formatted += "-" + digits.slice(7, 9);
    }
    if (digits.length >= 9) {
      formatted += "-" + digits.slice(9, 11);
    }

    e.target.value = formatted;
  });
}

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !phone) {
      formMessage.textContent = "Пожалуйста, заполните имя и телефон.";
      showToast("Заполните имя и телефон");
      return;
    }

    formMessage.textContent = "Отправляем заявку...";

    try {
      const payload = new FormData();
      payload.append("name", name);
      payload.append("phone", phone);
      payload.append("message", message);

      selectedFiles.forEach(function (file) {
        payload.append("attachments", file);
      });

      const response = await fetch("/api/requests", {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      formMessage.textContent = "Спасибо. Заявка отправлена.";
      showToast("Заявка успешно отправлена");
      form.reset();
      selectedFiles = [];
      renderFileList();
    } catch (error) {
      formMessage.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
      showToast("Ошибка отправки заявки");
      console.error(error);
    }
  });
}

function animateCounter(element) {
  const targetText = element.getAttribute("data-counter") || "0";
  const numericTarget = parseInt(targetText.replace(/\D/g, ""), 10);

  if (!numericTarget) return;

  let current = 0;
  const duration = 1400;
  const steps = 40;
  const increment = Math.ceil(numericTarget / steps);
  const stepTime = Math.max(16, Math.floor(duration / steps));

  const timer = setInterval(function () {
    current += increment;

    if (current >= numericTarget) {
      current = numericTarget;
      clearInterval(timer);
    }

    element.textContent = current;
  }, stepTime);
}

if (revealItems.length) {
  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          const counter = entry.target.querySelector("[data-counter]");
          if (counter && !counter.dataset.animated) {
            counter.dataset.animated = "true";
            animateCounter(counter);
          }

          if (entry.target.matches("[data-counter]") && !entry.target.dataset.animated) {
            entry.target.dataset.animated = "true";
            animateCounter(entry.target);
          }

          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach(function (item) {
    if (!item.classList.contains("is-visible")) {
      observer.observe(item);
    }
  });

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
}