import createCard from "./app";

export function saveCards() {
  const cards = {
    todo: getCards(".todo"),
    inProgress: getCards(".inProgress"),
    done: getCards(".done"),
  };
  localStorage.setItem("cards", JSON.stringify(cards));
}

function getCards(selector) {
  const cardsData = [];
  document.querySelectorAll(`${selector} .card .text`).forEach((card) => {
    cardsData.push(card.textContent);
  });
  return cardsData;
}

export function loadCards(todo, inProgress, done) {
  const cardsContent = JSON.parse(localStorage.getItem("cards"));
  if (!cardsContent) {
    return;
  }
  cardsContent.todo.forEach((card) => {
    addCard(card, todo);
  });
  cardsContent.inProgress.forEach((card) => {
    addCard(card, inProgress);
  });
  cardsContent.done.forEach((card) => {
    addCard(card, done);
  });
}

function addCard(cardContent, collumn) {
  const card = createCard(cardContent);
  collumn.append(card);
}
