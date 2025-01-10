// CORE FUNCTIONS
const createTaskElement = (taskText, taskCompleteCheckboxIsChecked) => {
  taskCon.innerHTML += `<div class="task">
  <input class="taskRemoveCheckbox" type="checkbox" name="taskRemoveCheckbox" hidden>
  <input class="taskCompleteCheckbox" type="checkbox" name="taskCompleteCheckbox" ${taskCompleteCheckboxIsChecked ? 'checked' : ''}>
  <span class="taskText">${taskText}</span></div>`;
}

const getCurrentDate = () => {
  const date = new Date();
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

const updateCurrentDateText = () => {
  const date = new Date();
  const dateToday = `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
  document.querySelector('#date-text').innerText = dateToday;
}

const checkLocalStorage = () => {
  if (!localStorage.getItem('ETMD')) {
    const initialData = { 'lastSavedDate': '', 'tasks': {} };
    localStorage.setItem('ETMD', JSON.stringify(initialData));
  }
}

const hideTaskRemoveCheckboxes = () => {
  if (document.querySelectorAll('.taskRemoveCheckbox')) {
    document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.hidden = true;
    });
  }
}

const editTasks = () => {
  canEditTasks = true;
  secondaryControlBox.hidden = !canEditTasks;

  document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => checkbox.hidden = false);
}

const toggleSelected = () => {
  document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => checkbox.checked = (checkbox.checked ? false : true));
}

const updateIfTaskCompleteCheckboxChange = e => {
  if (e.target.classList.contains('taskCompleteCheckbox')) {
    const taskText = e.target.closest('.task').querySelector('.taskText').innerText;
    const isChecked = e.target.checked;

    const ETMD = JSON.parse(localStorage.getItem('ETMD'));

    if (ETMD && ETMD.tasks && ETMD.tasks[currentDate]) {
      const tasks = ETMD.tasks[currentDate];

      const updatedTasks = tasks.map(task =>
        task.taskText === taskText ? { ...task, isChecked } : task
      );

      ETMD.tasks[currentDate] = updatedTasks;
      localStorage.setItem('ETMD', JSON.stringify(ETMD));
    }
  }
}

const viewTasks = () => {
  primaryControlBox.hidden = true;
  secondaryControlBox.hidden = true;
  canEditTasks = false;
  taskTextBox.hidden = true;
  goBackBtn.hidden = false;
  taskCon.innerHTML = '';

  const ETMD = JSON.parse(localStorage.getItem('ETMD'));

  Object.keys(ETMD.tasks)
    .sort((a, b) => new Date(b.split('-').reverse().join('-')) - new Date(a.split('-').reverse().join('-')))
    .forEach(day => {
      taskCon.innerHTML += `<h3>${day}</h3>`;
      ETMD.tasks[day].forEach(task => {
        taskCon.innerHTML += `
          <div class="view-task">
            <span>${task.isChecked ? '&#10004;' : '&#10008;'}</span>
            <span>${task.taskText}</span>
          </div>`;
      });
    });
};

// FUNCTIONS
const resetTasksForNewDay = () => {
  const ETMD = JSON.parse(localStorage.getItem('ETMD'));

  if (ETMD && ETMD.lastSavedDate !== currentDate) {
    const lastDayTasks = ETMD.tasks[ETMD.lastSavedDate] || [];
    const newTasks = lastDayTasks.map(task => ({ taskText: task.taskText, isChecked: false }));
    ETMD.lastSavedDate = currentDate;
    ETMD.tasks[currentDate] = newTasks;
    localStorage.setItem('ETMD', JSON.stringify(ETMD));

    taskCon.innerHTML = '';
    newTasks.forEach(task => createTaskElement(task.taskText, task.isChecked));
  }
};

const loadTasks = () => {
  const ETMD = JSON.parse(localStorage.getItem('ETMD'));
  const lastSavedDate = ETMD ? ETMD.lastSavedDate : null;

  if (lastSavedDate === currentDate) {
    const today = ETMD.tasks[currentDate];
    today.forEach(task => createTaskElement(task.taskText, task.isChecked));
  } else resetTasksForNewDay();
};

const goBack = () => {
  primaryControlBox.hidden = false;
  taskTextBox.hidden = false;
  goBackBtn.hidden = true;
  taskCon.innerHTML = '';
  loadTasks();
}

const addTask = () => {
  canEditTasks = false;
  secondaryControlBox.hidden = !canEditTasks;

  hideTaskRemoveCheckboxes();

  const task = prompt("Write your task.");
  if (task === null || task.trim() === '') return;

  const taskData = { taskText: task, isChecked: false };
  let ETMD = JSON.parse(localStorage.getItem('ETMD')) || { lastSavedDate: null, tasks: {} };
  if (!ETMD.tasks[currentDate]) ETMD.tasks[currentDate] = [];
  ETMD.tasks[currentDate].push(taskData);
  localStorage.setItem('ETMD', JSON.stringify(ETMD));

  createTaskElement(task, false);
};

const removeSelected = () => {
  canEditTasks = false;
  secondaryControlBox.hidden = !canEditTasks;

  const ETMD = JSON.parse(localStorage.getItem('ETMD'));
  const currentDate = getCurrentDate();

  if (ETMD && ETMD.tasks && ETMD.tasks[currentDate]) {
    const tasks = ETMD.tasks[currentDate];

    document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => {
      if (checkbox.checked) {
        const taskToRemove = checkbox.closest('.task');
        const taskTextToRemove = taskToRemove.querySelector('.taskText').innerText;
        taskToRemove.remove();

        const updatedTasks = tasks.filter(task => task.taskText !== taskTextToRemove);
        ETMD.tasks[currentDate] = updatedTasks;
        localStorage.setItem('ETMD', JSON.stringify(ETMD));
      }
    });
  }

  hideTaskRemoveCheckboxes();
};

const saveChanges = () => {
  removeSelected();

  canEditTasks = false;
  secondaryControlBox.hidden = !canEditTasks;
}

const onLoadFunction = () => {
  updateCurrentDateText();
  checkLocalStorage();
  loadTasks();
}

// VARIABLES
let canEditTasks = false;
const currentDate = getCurrentDate();

// Containers
const primaryControlBox = document.querySelector('#primary-control-box');
const secondaryControlBox = document.querySelector('#secondary-control-box');
const taskTextBox = document.querySelector('#task-text-box')
const taskCon = document.querySelector('#task-con');
// Control Buttons
const addTaskBtn = document.querySelector('#add-task-btn');
const editTasksBtn = document.querySelector('#edit-tasks-btn');
const viewTasksBtn = document.querySelector('#view-tasks-btn');
const goBackBtn = document.querySelector('#go-back-btn');
const toggleSelectBtn = document.querySelector('#toggle-select-btn');
const saveChangesBtn = document.querySelector('#save-changes-btn');

// EVENT LISTENERS 
window.addEventListener('load', onLoadFunction);
document.addEventListener('change', e => updateIfTaskCompleteCheckboxChange(e));
addTaskBtn.addEventListener('click', addTask);
editTasksBtn.addEventListener('click', editTasks);
viewTasksBtn.addEventListener('click', viewTasks);
goBackBtn.addEventListener('click', goBack);
toggleSelectBtn.addEventListener('click', toggleSelected);
saveChangesBtn.addEventListener('click', saveChanges);
