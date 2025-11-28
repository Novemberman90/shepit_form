
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
      setError(nameInput, "Це поле не може бути пустим");
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

  form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const isNameValid = validateName();
    const isPhoneValid = validatePhone();
    const isRatingValid = validateRating();

    if(!isNameValid || !isPhoneValid || !isRatingValid) {
      return;
    }

    console.log('Форма прошла валидацию успешно и готова к отрпавке');
  });


  /* Загрузка изображения */
  const fileInput = document.querySelector('#photos');
  const fileNameDisplay = document.querySelector('.preview');

  fileInput.addEventListener("change", function(params) {
    if ( fileInput.files.length > 0 ) {
      fileNameDisplay.textContent = fileInput.files[0].name;
      fileNameDisplay.classList.add('preview--selected');
    } else {
      fileNameDisplay.textContent =  "Файл не выбран";
      fileNameDisplay.classList.remove('preview--selected');
    }
  });
});