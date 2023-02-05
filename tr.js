// jshint esversion: 6

const translations = {
  de: {
    Größe: "Größe",
    Zahlenmauer: "Zahlenmauer",
    Richtige: "Richtige",
    Neu: "Neu",
    Instructions:
      "Die Aufgabe ist es in jedem Feld die Summe der beiden darunter liegenden Felder einzutragen. Wenn alles richtig ist wird die ganze Mauer grün! Sobald ein Feld falsch eingetragen ist, färbt sich der Rahmen rot. Wenn du dich besser auf die Aufgabe konzentrieren möchtest, kannst du auf die Überschrift drücken. Los geht's!",
  },
  en: {
    Größe: "Size",
    Zahlenmauer: "Wall of numbers",
    Richtige: "Solved",
    Neu: "New task",
    Instructions:
      "The task is to enter in each field the sum of the two fields below it. If everything is correct, the whole wall turns green! As soon as a field is entered incorrectly, the frame turns red. If you want to concentrate better on the task, you can press on the heading. Let's go!",
  },
  tr: {
    Größe: "Boyut",
    Zahlenmauer: "Duvar Numarası",
    Richtige: "Çözülen görevler",
    Neu: "Yeni görev",
    Instructions:
      "Görev, her alana altındaki iki alanın toplamını girmektir. Her şey doğruysa, tüm duvar yeşile döner! Bir alan yanlış girildiğinde çerçeve kırmızıya döner. Göreve daha iyi konsantre olmak istiyorsanız, başlığın üzerine basabilirsiniz. Hadi gidelim!",
  },
  uk: {
    Neu: "Нове завдання",
    Größe: "Висота",
    Zahlenmauer: "Номерна стіна",
    Richtige: "Вирішені завдання",
    Instructions:
      "Завдання полягає в тому, щоб ввести суму двох полів нижче в кожне поле. Якщо все зроблено правильно, вся стіна стає зеленою! Якщо поле введено неправильно, рамка стає червоною. Якщо ви хочете краще сконцентруватися на завданні, ви можете натиснути на заголовок. Ходімо!",
  },
  jp: {
    Neu: "新しい課題",
    Größe: "高さ",
    Richtige: "解決したタスクの数",
    Zahlenmauer: "数字の壁",
    Instructions:
      "課題は、下の2つのフィールドの合計をそれぞれのフィールドに入力することです。すべてが正しく行われると、壁全体が緑色に変わります 入力に間違いがあると、すぐに枠が赤くなります。より集中したい場合は、見出しを押すとよいでしょう。さあ、行こう!",
  },
};

let isin = (arr, e) => arr.indexOf(e) >= 0;

let language = "de";

function t(key) {
  if (isin(Object.keys(translations), language)) {
    if (translations[language][key]) {
      return translations[language][key];
    } else {
      console.log("Translate me for " + language + ": '" + key + "'");
      return key;
    }
  } else {
    return key;
  }
}

t.setLanguage = (lang) => {
  language = lang;
};

t.getLanguages = () => {
  return [...Object.keys(translations)];
};

t.currentLanguage = () => language;

export default t;
