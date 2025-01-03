const getCurrentDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const loadTasksFromLocalStorage = () => {
  const currentDate = getCurrentDate();
  const tasks = JSON.parse(localStorage.getItem(currentDate)) || [];
  return tasks;
};

const saveTasksToLocalStorage = (tasks) => {
  const currentDate = getCurrentDate();
  localStorage.setItem(currentDate, JSON.stringify(tasks));
};

const resetTasksForNewDay = () => {
  const currentDate = getCurrentDate();
  const lastSavedDate = localStorage.getItem('lastSavedDate');

  if (lastSavedDate !== currentDate) {
    const tasks = [];
    document.querySelectorAll('.task').forEach(task => {
      const taskText = task.querySelector('span').innerText;
      const isChecked = task.querySelector('.taskCompleteChb').checked;
      tasks.push({ taskText, isChecked });
    });

    if (tasks.length > 0) {
      saveTasksToLocalStorage(tasks); // Save previous day's tasks
    }

    localStorage.setItem('lastSavedDate', currentDate);
    taskCon.innerHTML = ''; // Clear UI for new day
  }
};

const date = new Date();
const dateToday = `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
document.querySelector('#date-span').innerText = dateToday;

const addBtn = document.querySelector('#add-btn');
const removeBtn = document.querySelector('#remove-btn');
const acceptBtn = document.querySelector('#accept-btn');
const taskCon = document.querySelector('#task-con');

const hideTaskRemoveCheckboxes = () => document.querySelectorAll('.taskRemoveChb').forEach(checkbox => checkbox.style.display = "none");

const showTaskRemoveCheckboxes = () => document.querySelectorAll('.taskRemoveChb').forEach(checkbox => checkbox.style.display = "inline-block");

const addTask = () => {
  acceptBtn.style.display = "none";
  hideTaskRemoveCheckboxes();

  const task = prompt("Write your task.");
  if (!task) return;

  const tasks = loadTasksFromLocalStorage();
  const newTask = { taskText: task, isChecked: false };
  tasks.push(newTask);
  saveTasksToLocalStorage(tasks);

  taskCon.innerHTML += `<div class="task">
          <input class="taskRemoveChb" type="checkbox">
          <input class="taskCompleteChb" type="checkbox">
          <span>${task}</span>
        </div>`;
};

const removeTask = () => {
  acceptBtn.style.display = "inline-block";
  showTaskRemoveCheckboxes();
};

const acceptActions = () => {
  acceptBtn.style.display = "none";
  hideTaskRemoveCheckboxes();

  document.querySelectorAll('.taskRemoveChb').forEach(checkbox => {
    if (checkbox.checked) {
      const taskToRemove = checkbox.closest('.task');
      const taskTextToRemove = taskToRemove.querySelector('span').innerText;

      taskToRemove.remove();

      const tasks = loadTasksFromLocalStorage();
      const updatedTasks = tasks.filter(task => task.taskText !== taskTextToRemove);
      saveTasksToLocalStorage(updatedTasks);
    }
  });
};

document.addEventListener('change', (event) => {
  if (event.target.classList.contains('taskCompleteChb')) {
    const taskText = event.target.closest('.task').querySelector('span').innerText;
    const isChecked = event.target.checked;

    const tasks = loadTasksFromLocalStorage();
    const updatedTasks = tasks.map(task =>
      task.taskText === taskText ? { taskText, isChecked } : task
    );

    saveTasksToLocalStorage(updatedTasks);
  }
});

window.addEventListener('load', () => {
  resetTasksForNewDay();

  const tasks = loadTasksFromLocalStorage();
  tasks.forEach(task => {
    taskCon.innerHTML += `<div class="task">
          <input class="taskRemoveChb" type="checkbox">
          <input class="taskCompleteChb" type="checkbox" ${task.isChecked ? 'checked' : ''}>
          <span>${task.taskText}</span>
        </div>`;
  });
});

addBtn.addEventListener('click', addTask);
removeBtn.addEventListener('click', removeTask);
acceptBtn.addEventListener('click', acceptActions);
