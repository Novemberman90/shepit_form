
window.addEventListener('DOMContentLoaded',()=>{

  /* Валидация формы */
  const form = document.getElementById('feedbackForm'),
        nameInput = document.getElementById('name'),
        phoneInput = document.getElementById('phone'),
        sendBtn = document.getElementById('sendBtn');

  const setError = (inputEl, messege) => {
    const box = inputEl.closest('.input-box');
    const errorMsg = box.querySelector('.error-message');

    box.classList.add('error');
    errorMsg.textContent = messege;
    errorMsg.style.display = 'block';
  }
 
  const clearError = (inputEl) => {
    const box = inputEl.closest('.input-box');
    const errorMsg = box.querySelector('.error-message');

    box.classList.remove('error');
    errorMsg.style.display = 'none';
  }

  /* Перевірка ім`я */

  const validateName = () => {
    const value = nameInput.value.trim();

    if(!value) {
      setError(nameInput, "Це поле не може бути пустим");
      return false;
    }

    if(!/^[A-Za-zА-Яа-яІіЇїЄє\s]{3,}$/.test(value)) {
      setError(nameInput, "Ім'я містить не допустимі символи");
      return false;
    }

    clearError(nameInput);
    return true;
  }

  /* Проверка телефона */
  const validatePhone = () =>{
    // const value = phoneInput.value.trim();
  const value = phoneInput.value.replace(/\D/g, ""); // только цифры

    if(!value) {
      setError(phoneInput, "Це поле не може бути пустим");
      return false;
    }

    /* if (!/^\d{10,15}$/.test(value)) {
      setError(phoneInput, "Введіть коректний номер (тільки цифри).");
      return false;
    } */

    if (value.length < 10) {
    setError(phoneInput, "Ви ввели неповний номер");
    return false;
  }
    clearError(phoneInput);
    return true;
  }

    
  phoneInput.addEventListener("input", () => {
    let value = phoneInput.value.replace(/\D/g, "");

    if (value.startsWith("380")) {
      value = "+" + value;
    } else if (value.startsWith("0")) {
      value = "+38" + value;
    }

    phoneInput.value = value;

    validatePhone();
  });


  /* Валидация рейтига */

  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  const ratingError = document.querySelector('.rating-error-message');

  const validateRating = () => {
    const isCheched = [...ratingInputs].some(input => input.checked);

    if(!isCheched) {
      ratingError.style.display = "block";
      return false;
    }

    ratingError.style.display = "none";
    return true;
  }

    // Скрыть ошибку при выборе звезды
  ratingInputs.forEach(input => {
    input.addEventListener("change", () => {
      validateRating(); 
    });
  });


  /* Убираю сообщение об ошибке */
  nameInput.addEventListener("input", validateName);
  phoneInput.addEventListener("input", validatePhone);




  /* === Хранилище выбранных файлов === */
let selectedFiles = [];

/* Элементы */
const fileInput = document.querySelector('#photos');
const previewContainer = document.getElementById("photoPreview");

  /* === Добавление файлов === */
  fileInput.addEventListener("change", () => {
    const newFiles = Array.from(fileInput.files);
    let hasError = false;

    // Проверка количества
    if (selectedFiles.length + newFiles.length > 5) {
      previewContainer.innerHTML = `<p class="preview__none--active">Максимум 5 фото.</p>`;
      fileInput.value = "";
      return;
    }

    // Проверка размера
    newFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        previewContainer.innerHTML = `<p class="preview__none--active">Файл <b>${file.name}</b> перевищує 5 МБ.</p>`;
        fileInput.value = "";
        hasError = true;
        return; // выходим только из цикла
      }

      selectedFiles.push(file);
    });

    if (hasError) return;   // остановил выполнение, чтобы НЕ вызывать renderFileList()

    fileInput.value = "";  
    renderFileList();
  });

/*  Отрисовка списка файлов  */
  function renderFileList() {
  previewContainer.innerHTML = "";

  if (selectedFiles.length === 0) {
    previewContainer.innerHTML = `<p class="preview__none">Файл не вибрано. Максимальний розмір 5 МВ</p>`;
    return;
  } 

  selectedFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.classList.add("preview__item");
    item.innerHTML = `
      <span class="file-name">${file.name}</span>
      <button class="delete-file" data-index="${index}">Х</button>
    `;

    previewContainer.appendChild(item);
  });

  // обработчик на кнопки удаления
    document.querySelectorAll(".delete-file").forEach(btn => {
      btn.addEventListener("click", deleteFile);
    });
  }

  /* Удаление файла */
  const deleteFile =(e)=> {
    const index = e.target.dataset.index;
    selectedFiles.splice(index, 1); // удалить файл из массива
    renderFileList();               // перерисовать список
  }

/*     form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isRatingValid = validateRating();

    if(!isNameValid || !isPhoneValid || !isRatingValid) {
      return;
    }

    console.log('Форма прошла валидацию успешно и готова к отрпавке');
  }); */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isNameValid = validateName();
  const isPhoneValid = validatePhone();
  const isRatingValid = validateRating();

  if (!isNameValid || !isPhoneValid) {
    return;
  }

  // Получаем рейтинг
  const ratingValue = [...ratingInputs].find(r => r.checked)?.value || "0";

  const formData = new FormData();
  formData.append("name", nameInput.value.trim());
  formData.append("phone", phoneInput.value.trim());
  formData.append("rating", ratingValue);
  formData.append("message", document.getElementById("message").value.trim() || "");

  selectedFiles.forEach((file) => {
    formData.append("photos[]", file);
  });

  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  spinner.innerHTML = "<span>Відправка...</span>";
  form.insertAdjacentElement("afterend", spinner);

  try {
    const response = await fetch("../mail.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    console.log(result);

    spinner.remove();
    showSuccessMessage();

     form.reset();
    ratingInputs.forEach(r => (r.checked = false));
    selectedFiles = [];
    renderFileList();

  } catch (error) {
    console.error("Мережева помилка або помилка сервера:", error);
    spinner.remove();
    //showSuccessMessage();
    document.getElementById("formStatus").textContent = "Помилка зв'язку з сервером. Перевірте підключення.";
  }
});


    /* === SUCCESS POPUP === */
  const successMessage = document.getElementById("successMessage");
  const closeSuccess = document.getElementById("closeSuccess");
  let successTimer;

  /* Показ окна */
  function showSuccessMessage() {
    successMessage.classList.add("active");

    // Автозакрытие через 5 секунд
    successTimer = setTimeout(() => {
      hideSuccessMessage();
    }, 5000);
  }

  /* Скрыть окно */
  function hideSuccessMessage() {
    successMessage.classList.remove("active");
    clearTimeout(successTimer);
  }

  /* Закрытие по кнопке */
  closeSuccess.addEventListener("click", hideSuccessMessage);

  

});


