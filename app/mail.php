<?php

// Настройки
$admin_email = "alexledovit@gmail.com"; // ← сюда писать свой почтовый ящик
$project_name = "Shepit Relax Park - Відгук";
$form_subject = "Новий відгук з сайту";

// Проверка метода
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(["error" => "Метод не дозволений"]);
  exit;
}

// ------- ПОЛУЧЕНИЕ ДАННЫХ -------
$name    = htmlspecialchars(trim($_POST["name"] ?? ""));
$phone   = htmlspecialchars(trim($_POST["phone"] ?? ""));
$rating  = htmlspecialchars(trim($_POST["rating"] ?? ""));
$message = htmlspecialchars(trim($_POST["message"] ?? ""));


// ------- ФОРМИРУЕМ HTML ПИСЬМО -------
$email_body = "
<h2>Новий відгук з сайту</h2>
<table style='border-collapse: collapse; width: 100%;'>
    <tr><td><b>Імʼя:</b></td><td>$name</td></tr>
    <tr><td><b>Телефон:</b></td><td>$phone</td></tr>
    <tr><td><b>Оцінка:</b></td><td>$rating</td></tr>
    <tr><td><b>Коментар:</b></td><td>$message</td></tr>
</table>
";


// ------- ОТПРАВКА С ВЛОЖЕНИЯМИ -------
$boundary = md5(time());

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
$headers .= "From: " . adopt($project_name) . " <{$admin_email}>\r\n";

$email_message  = "--$boundary\r\n";
$email_message .= "Content-Type: text/html; charset=\"utf-8\"\r\n";
$email_message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$email_message .= $email_body . "\r\n";


// Файлы
if (!empty($_FILES['photos']['name'][0])) {

  for ($i = 0; $i < count($_FILES['photos']['name']); $i++) {

    if ($_FILES['photos']['error'][$i] === 0) {

      $file_tmp  = $_FILES['photos']['tmp_name'][$i];
      $file_name = $_FILES['photos']['name'][$i];
      $file_type = $_FILES['photos']['type'][$i];
      $file_data = chunk_split(base64_encode(file_get_contents($file_tmp)));

      $email_message .= "--$boundary\r\n";
      $email_message .= "Content-Type: $file_type; name=\"$file_name\"\r\n";
      $email_message .= "Content-Disposition: attachment; filename=\"$file_name\"\r\n";
      $email_message .= "Content-Transfer-Encoding: base64\r\n\r\n";
      $email_message .= $file_data . "\r\n";
    }
  }
}

$email_message .= "--$boundary--";

// Отправка
file_put_contents("log.txt", print_r($_POST, true) . "\n\n", FILE_APPEND);

$sent = mail($admin_email, adopt($form_subject), $email_message, $headers);

// Ответ клиенту (JS)
echo json_encode([
  "status" => $sent ? "success" : "error",
  "message" => $sent ? "Ваш відгук надіслано!" : "Помилка надсилання листа."
]);


// Кодировка заголовков
function adopt($text)
{
  return '=?UTF-8?B?' . base64_encode($text) . '?=';
}
