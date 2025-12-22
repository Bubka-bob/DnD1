export default class Task {
  constructor(container, headerText) {
    this.container = container;
    this.headerText = headerText;
    this.tasks = [];
    this.savedCards = {};

    const tasksDiv = document.createElement("div");
    tasksDiv.classList.add("container-task");
    container.append(tasksDiv);

    const header = document.createElement("div");
    header.classList.add("tasks_header");
    tasksDiv.append(header);

    const h4 = document.createElement("h4");
    h4.classList.add("tasks_header_text");
    h4.textContent = headerText;
    header.append(h4);

    const optionsBtn = document.createElement("span");
    optionsBtn.classList.add("task_header_options");
    optionsBtn.textContent = "...";
    header.append(optionsBtn);

    const taskList = document.createElement("div");
    taskList.classList.add("task_list");
    tasksDiv.append(taskList);

    const adderCard = document.createElement("div");
    adderCard.classList.add("card_form");
    adderCard.textContent = "+ Add another card";
    tasksDiv.append(adderCard);

    adderCard.addEventListener("click", (e) => this.onAddCardClick(e));

    taskList.addEventListener("mousedown", (e) => this.onMouseDownTask(e));

    this.tasksDiv = tasksDiv;
    this.taskList = taskList;
    this.adderCard = adderCard;

    this.dragging = null;
    this.startX = 0;
    this.startY = 0;

    this.tasksDiv._taskInstance = this;

    this.loadState();
  }

  saveState() {
    const state = [];

    Array.from(this.taskList.children).forEach((child) => {
      state.push(child.querySelector(".content_card").innerText.trim());
    });

    localStorage.setItem(`tasks-${this.headerText}`, JSON.stringify(state));
  }

  loadState() {
    const savedState = localStorage.getItem(`tasks-${this.headerText}`);

    if (savedState) {
      const parsedState = JSON.parse(savedState);

      while (this.taskList.firstChild) {
        this.taskList.firstChild.remove();
      }

      parsedState.forEach((text) => {
        this.addCard(text);
      });
    }
  }

  onMouseDownTask(e) {
    e.preventDefault();

    if (e.button !== 0 || !e.target.classList.contains("task_card")) return;

    this.dragging = e.target;

    const rect = this.dragging.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    this.previousNeighbour = this.dragging.previousElementSibling;
    this.nextNeighbour = this.dragging.nextElementSibling;

    this.placeholder = document.createElement("div");
    this.placeholder.style.width = `${this.dragging.offsetWidth}px`;
    this.placeholder.style.height = `${this.dragging.offsetHeight}px`;
    this.dragging.parentNode.insertBefore(this.placeholder, this.dragging);

    this.dragging.classList.add("dragging");

    this.dragging.style.left = `${rect.left}px`;
    this.dragging.style.top = `${rect.top}px`;
    this.dragging.style.width = `${rect.width}px`;

    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    document.documentElement.addEventListener("mouseup", this.onMouseUp);
    document.documentElement.addEventListener("mousemove", this.onMouseMove);
  }

  onMouseMove(e) {
    if (!this.dragging) return;

    const posX = e.clientX - this.startX;
    const posY = e.clientY - this.startY;
    this.dragging.style.left = `${posX}px`;
    this.dragging.style.top = `${posY}px`;

    const { target } = e;
    if (target.classList.contains("task_card")) {
      const rect = target.getBoundingClientRect();
      const dropY = e.clientY - rect.top;
      if (dropY > rect.height / 2) {
        target.parentNode.insertBefore(this.placeholder, target.nextSibling);
      } else {
        target.parentNode.insertBefore(this.placeholder, target);
      }
    }
  }

  onMouseUp(e) {
    if (!this.dragging) return;

    this.dragging.style = " ";

    const { target } = e;
    let previous = target.previousElementSibling;
    if (previous && !previous.classList.contains("task_card")) {
      previous = null;
    }
    let next = target.nextElementSibling;
    if (next && !next.classList.contains("task_card")) {
      next = null;
    }

    const targetList = target.closest(".task_list");
    let container = targetList;

    if (!targetList) {
      previous = this.previousNeighbour;
      next = this.nextNeighbour;
      container = this.dragging.parentNode;
    } else if (targetList && !previous && !next) {
      targetList.append(this.dragging);
    }

    if (previous) {
      container.insertBefore(this.dragging, previous.nextSibling);
    } else if (next) {
      container.insertBefore(this.dragging, next);
    } else {
      container.append(this.dragging);
    }

    this.dragging.classList.remove("dragging");

    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }

    const allContainers = document.querySelectorAll(".container-task");
    allContainers.forEach((container) => {
      const taskInstance = container._taskInstance;
      if (taskInstance) {
        taskInstance.saveState();
      }
    });

    this.dragging = null;
    this.placeholder = null;

    // this.saveState();

    document.documentElement.removeEventListener("mouseup", this.onMouseUp);
    document.documentElement.removeEventListener("mousemove", this.onMouseMove);
  }

  onAddCardClick(e) {
    if (e.button !== 0) return;
    this.addCard();
  }

  addCard(textTask = undefined) {
    const card = document.createElement("div");
    card.classList.add("task_card");

    const closeContainer = document.createElement("div");
    closeContainer.classList.add("close_button_container");
    card.append(closeContainer);

    const closeButton = document.createElement("span");
    closeButton.classList.add("close_button");
    closeButton.innerText = "×";

    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.removeCard(card);
    });

    closeContainer.append(closeButton);

    const cardText = document.createElement("div");
    cardText.classList.add("content_card");
    if (!textTask) {
      cardText.innerText = "Нажмите карандаш, чтобы начать редактирование";
    } else {
      cardText.setAttribute("contenteditable", "true");
      cardText.innerText = textTask;
    }

    card.append(cardText);

    const editIcon = document.createElement("div");
    editIcon.classList.add("card_text_edit");
    editIcon.innerText = "\u270E";
    card.append(editIcon);

    editIcon.addEventListener("click", () => {
      if (cardText.getAttribute("contenteditable") === null) {
        cardText.textContent = "";
      }
      cardText.setAttribute("contenteditable", "true");
      cardText.focus();
    });

    this.taskList.append(card);

    this.saveState();
  }

  removeCard(card) {
    card.remove();
    this.saveState();
  }
}
