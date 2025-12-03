// app.js

import { saveCards, loadCards } from "./localStorage";

export default function createCard(textContent) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.draggable = true; // делаем каждую карточку перетаскиваемой
  const text = document.createElement("span");
  text.classList.add("text");
  text.textContent = textContent;

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("close");
  const cross = document.createElement("span");
  cross.classList.add("cross");
  cross.textContent = "×";

  removeBtn.append(cross);
  card.append(text);
  card.append(removeBtn);
  removeBtn.addEventListener("click", deleteCard);
  removeBtn.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  return card;
}

function deleteCard(e) {
  e.preventDefault();
  const el = e.currentTarget;
  const parent = el.closest(".card");
  parent.remove();
  saveCards();
}

document.addEventListener("DOMContentLoaded", () => {
  const toDoCards = document.querySelector(".todo");
  const inProgressCards = document.querySelector(".inProgress");
  const doneCards = document.querySelector(".done");
  const addBtns = document.querySelectorAll(".add-card-btn");

  function createTextForm(e) {
    const el = e.currentTarget;
    const parent = el.closest(".collumn");

    const currentForm = document.querySelector(".form-container");
    if (currentForm) {
      currentForm.remove();
    }

    const formContainer = document.createElement("div");
    formContainer.classList.add("form-container");
    const form = document.createElement("form");
    form.classList.add("form");

    const field = document.createElement("textarea");
    field.classList.add("text-field");
    field.placeholder = "Enter a title for this card ...";
    field.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });

    const createBtn = document.createElement("button");
    createBtn.classList.add("formBtn", "create-card");
    createBtn.textContent = "Add Card";

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("cross", "close-form");
    closeBtn.textContent = "\u2715";

    form.append(field);
    form.append(createBtn);
    form.append(closeBtn);
    formContainer.append(form);

    if (parent.querySelector(".todo")) {
      createBtn.classList.add("toDoCollumn");
      toDoCards.append(formContainer);
    } else if (parent.querySelector(".inProgress")) {
      createBtn.classList.add("inProgressCollumn");
      inProgressCards.append(formContainer);
    } else if (parent.querySelector(".done")) {
      createBtn.classList.add("doneCollumn");
      doneCards.append(formContainer);
    }

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      formContainer.remove();
    });

    createBtn.addEventListener("click", addNewCard);
  }

  addBtns.forEach((button) => {
    button.addEventListener("click", createTextForm);
  });

  function addNewCard(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const formContainer = document.querySelector(".form-container");
    const field = document.querySelector(".text-field");
    if (field.value.trim() === "") {
      return;
    }
    const card = createCard(field.value);

    if (el.classList.contains("toDoCollumn")) {
      toDoCards.append(card);
    } else if (el.classList.contains("inProgressCollumn")) {
      inProgressCards.append(card);
    } else if (el.classList.contains("doneCollumn")) {
      doneCards.append(card);
    }
    formContainer.remove();
    saveCards();
  }

  loadCards(toDoCards, inProgressCards, doneCards);

  // Улучшенная реализация drag-and-drop
  const container = document.querySelector(".tasks-container");

  let draggedItem = null;
  let placeholder = null;

  function createPlaceholder(height) {
    if (placeholder) {
      placeholder.remove();
    }
    placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");
    placeholder.style.height = height + "px";
    return placeholder;
  }

  function removePlaceholder() {
    if (placeholder) {
      placeholder.remove();
    }
  }

  function findNearestCard(element) {
    while (!element.classList.contains("card") && element !== container) {
      element = element.parentNode;
    }
    return element;
  }

  function determineInsertPosition(targetElement, clientY) {
    const rect = targetElement.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    return clientY > midPoint ? "afterbegin" : "beforebegin";
  }

  container.addEventListener("dragstart", (event) => {
    draggedItem = event.target;
    container.addEventListener("dragover", onDragOver);
    container.addEventListener("drop", onDrop);
    container.addEventListener("dragend", onDragEnd);
  });

  function onDragOver(event) {
    event.preventDefault();
    const targetColumn = event.target.closest(".cards-list");
    if (!targetColumn) return;

    // Получаем ближайшую карточку или проверяем, что колонка пустая
    let nearestCard = findNearestCard(event.target);

    if (nearestCard && nearestCard !== draggedItem) {
      // Есть ближайшая карточка
      const insertPosition = determineInsertPosition(
        nearestCard,
        event.clientY,
      );
      removePlaceholder();
      const placeholderHeight = draggedItem.offsetHeight;
      const newPlaceholder = createPlaceholder(placeholderHeight);

      // Правильная вставка placeholder перед/после нужной карточки
      if (insertPosition === "beforebegin") {
        nearestCard.parentNode.insertBefore(newPlaceholder, nearestCard);
      } else {
        nearestCard.parentNode.insertBefore(
          newPlaceholder,
          nearestCard.nextSibling,
        );
      }
    } else if (!nearestCard) {
      // Колонка пустая, добавляем placeholder в конец колонки
      const placeholderHeight = draggedItem.offsetHeight;
      const newPlaceholder = createPlaceholder(placeholderHeight);
      targetColumn.append(newPlaceholder);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    if (placeholder && draggedItem) {
      placeholder.parentNode.insertBefore(draggedItem, placeholder);
      removePlaceholder();
      saveCards();
    }
  }

  function onDragEnd() {
    container.removeEventListener("dragover", onDragOver);
    container.removeEventListener("drop", onDrop);
    container.removeEventListener("dragend", onDragEnd);
    removePlaceholder();
  }

  // Специальная логика для начальной загрузки перетаскивания
  const columns = document.querySelectorAll(".collumn");
  columns.forEach((col) => {
    col.addEventListener("dragstart", (event) => {
      draggedItem = event.target;
      container.addEventListener("dragover", onDragOver);
      container.addEventListener("drop", onDrop);
      container.addEventListener("dragend", onDragEnd);
    });
  });
});
