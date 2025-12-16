import Task from "./Task";

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container");
  const tasks = container.querySelectorAll(".task");
  const task1 = tasks[0];

  const containerTasks = document.createElement("div");
  containerTasks.classList.add("container-tasks");
  task1.append(containerTasks);

  const tasksTodo = new Task(containerTasks, "todo");
  const tasksInProgress = new Task(containerTasks, "in progress");
  const tasksDone = new Task(containerTasks, "done");

  tasksTodo.loadState();
  tasksInProgress.loadState();
  tasksDone.loadState();
});
