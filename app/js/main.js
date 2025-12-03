
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
      ratingError.style.visibility = "visible";
      return false;
    }

    ratingError.style.visibility = "hidden";
    return true;
  }


  let lastCheckedRating = null;
  ratingInputs.forEach(input => {
    input.addEventListener('click', (e)=>{
    // Повторный клик по уже выбранной звезде → сбрасываем рейтинг
      if(lastCheckedRating === e.target) {
        e.target.checked = false;
        lastCheckedRating = null;
        validateRating(); // просим поставить оценку
        return;
      }
      // запоминаю выбранный элемент
      lastCheckedRating = e.target;
      validateRating(); // серыть ошибку
    })
  });

  /* Убираю сообщение об ошибке */
  nameInput.addEventListener("input", validateName);
  phoneInput.addEventListener("input", validatePhone);




  /* === Хранилище выбранных файлов === */
let selectedFiles = [];

/* Элементы */
const fileInput = document.querySelector('#photos');
const previewContainer = document.getElementById("photoPreview");
const photoBlockError = document.querySelector('.form__photo-error');

  /* === Добавление файлов === */
/*   fileInput.addEventListener("change", () => {
    const newFiles = Array.from(fileInput.files);
    let hasError = false;

    // Проверка количества
    if (selectedFiles.length + newFiles.length > 5) {
      //previewContainer.innerHTML = `<p class="preview__none--active">Максимум 5 фото.</p>`;
     // previewContainer.innerHTML = "";
      photoBlockError.innerHTML = `<p class="form__photo-error-txt form__photo-error-txt--active">Максимум 5 фото.</p>`;
      fileInput.value = "";
      return;
    }

    // Проверка размера
    newFiles.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
       // previewContainer.innerHTML = `<p class="preview__none--active">Файл <b>${file.name}</b> перевищує 5 МБ.</p>`;
        photoBlockError.innerHTML = `<p class="form__photo-error-txt form__photo-error-txt--active">Файл <b>${file.name}</b> перевищує 5 МБ.</p>`;
        fileInput.value = "";
        hasError = true;
        return; // выходим только из цикла
      }

      selectedFiles.push(file);
    });

    if (hasError) return;   // остановил выполнение, чтобы НЕ вызывать renderFileList()

    photoBlockError.innerHTML ="";

    fileInput.value = "";  
    renderFileList();
  }); */

/* === Добавление файлов === */
fileInput.addEventListener("change", () => {
  const newFiles = Array.from(fileInput.files);
  let hasError = false;

  let totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  // Добавляем файлы в сумму
  newFiles.forEach(file => totalSize += file.size);

  // Превышение лимита 25 МБ
  if (totalSize > 25 * 1024 * 1024) {
    photoBlockError.innerHTML = `
      <p class="form__photo-error-txt form__photo-error-txt--active">
        Перевищено максимальний розмір 25 МБ. Видаліть зайві файли.
      </p>
    `;
    fileInput.value = "";
    return;
  }

  // Добавляем файлы
  newFiles.forEach(file => selectedFiles.push(file));

  fileInput.value = "";
  renderFileList();
  updateStorageInfo();
});


/*  Отрисовка списка файлов  */
/*   function renderFileList() {
  previewContainer.innerHTML = "";

  if (selectedFiles.length === 0) {
    photoBlockError.innerHTML = `<p class="form__photo-error-txt">Файл не вибрано. Максимальний розмір 5 МВ</p>`;
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
  } */

    const renderFileList =()=> {
  previewContainer.innerHTML = "";

  if (selectedFiles.length === 0) {
    photoBlockError.innerHTML = `<p class="form__photo-hint">Доступно для завантаження: 25 МБ Файл</p> `;
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

  updateStorageInfo();
  }

  const updateStorageInfo =() => {
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 25 * 1024 * 1024;
    const remaining = maxSize - totalSize;

    // Приводим к МБ
    const toMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

    if (totalSize === 0) {
      photoBlockError.innerHTML = `<p class="form__photo-error-txt">Файл не вибрано.</p> <p class="form__photo-hint">Доступно для завантаження: ${toMB(maxSize)} МБ</p>`;
    } else {
      photoBlockError.innerHTML = `
        <p class="form__photo-hint">
          Завантажено: ${toMB(totalSize)} МБ із 25 МБ<br>
          Залишилось: ${toMB(remaining)} МБ
        </p>
      `;
    }
  }


  /* Удаление файла */
/*   const deleteFile =(e)=> {
    const index = e.target.dataset.index;
    selectedFiles.splice(index, 1); // удалить файл из массива
    renderFileList();               // перерисовать список
  } */

    const deleteFile = (e) => {
  const index = e.target.dataset.index;
  selectedFiles.splice(index, 1);
  renderFileList();
  updateStorageInfo();
};

// Получаем QR ID из URL
const urlParams = new URLSearchParams(window.location.search);
const qrId = urlParams.get("qr");

// Записываем в скрытое поле
document.getElementById("qr_id").value = qrId;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isNameValid = validateName();
  const isPhoneValid = validatePhone();
 

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
  formData.append("QR_ID", qrId);

  selectedFiles.forEach((file) => {
    formData.append("photos[]", file);
  });

  const spinner = document.createElement("div");
  spinner.classList.add("spinner");
  spinner.innerHTML = "<span>Відправка...</span>";
  form.insertAdjacentElement("afterend", spinner);
  console.log("Отправляем рейтинг:", ratingValue);
  try {
    //https://shepit.archiviz.biz/mail.php
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


