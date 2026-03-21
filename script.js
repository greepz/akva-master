const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const phoneInput = document.getElementById("phone");
const burgerButton = document.getElementById("burgerButton");
const mobileMenu = document.getElementById("mobileMenu");
const revealItems = document.querySelectorAll(".reveal");

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

    const payload = {
      name: name,
      phone: phone,
      message: message
    };

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      formMessage.textContent = "Спасибо. Заявка отправлена.";
      showToast("Заявка успешно отправлена");
      form.reset();
    } catch (error) {
      formMessage.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
      showToast("Ошибка отправки заявки");
      console.error(error);
    }
  });
}

if (revealItems.length) {
  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
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
    observer.observe(item);
  });
}