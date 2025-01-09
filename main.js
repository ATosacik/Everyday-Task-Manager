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

const resetTasksForNewDay = () => {
  const etmd = JSON.parse(localStorage.getItem('ETMD'));

  if (etmd && etmd.lastSavedDate !== currentDate) {
    const lastDayTasks = etmd.tasks[etmd.lastSavedDate] || [];
    const newTasks = lastDayTasks.map(task => ({
      taskText: task.taskText,
      isChecked: false
    }));

    etmd.tasks[currentDate] = newTasks;
    etmd.lastSavedDate = currentDate;
    localStorage.setItem('ETMD', JSON.stringify(etmd));

    taskCon.innerHTML = '';
    newTasks.forEach(task => {
      taskCon.innerHTML += `
        <div class="task">
          <input class="taskRemoveCheckbox" type="checkbox" name="taskRemoveCheckbox" hidden>
          <input class="taskCompleteCheckbox" type="checkbox" name="taskCompleteCheckbox" ${task.isChecked ? 'checked' : ''}>
          <span class="taskText">${task.taskText}</span>
        </div>
      `;
    });
    console.log('Tasks reset for the new day, and all are set to unchecked.');
  } else {
    console.log('lastSavedDate matches currentDate. No changes needed.');
  }
};

const loadTasks = () => {
  const ETMD = JSON.parse(localStorage.getItem('ETMD'));
  const lastSavedDate = ETMD ? ETMD.lastSavedDate : null;
  const tasks = ETMD ? ETMD.tasks : null;

  if (lastSavedDate === currentDate) {
    const today = ETMD.tasks[currentDate];
    today.forEach(task => {
      taskCon.innerHTML += `<div class="task">
        <input class="taskRemoveCheckbox" type="checkbox" name="taskRemoveCheckbox" hidden>
        <input class="taskCompleteCheckbox" type="checkbox" name="taskCompleteCheckbox" ${task.isChecked ? 'checked' : ''}>
        <span class="taskText">${task.taskText}</span>
      </div>`;
    });
  } else {
    resetTasksForNewDay();
  }
};

const hideTaskRemoveCheckboxes = () => {
  if (document.querySelectorAll('.taskRemoveCheckbox')) {
    document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.hidden = true;
    });
  }
}

const addTask = () => {
  canEditTasks = false;
  secondaryControlBox.hidden = !canEditTasks;
  hideTaskRemoveCheckboxes();

  const task = prompt("Write your task.");

  if (task === null || task.trim() === '') return;

  const taskData = { taskText: task, isChecked: false };
  let etmd = JSON.parse(localStorage.getItem('ETMD')) || { lastSavedDate: null, tasks: {} };
  if (!etmd.tasks[currentDate]) etmd.tasks[currentDate] = [];
  etmd.tasks[currentDate].push(taskData);
  localStorage.setItem('ETMD', JSON.stringify(etmd));

  taskCon.innerHTML += `<div class="task">
    <input class="taskRemoveCheckbox" type="checkbox" name="taskRemoveCheckbox" hidden>
    <input class="taskCompleteCheckbox" type="checkbox" name="taskCompleteCheckbox">
    <span class="taskText">${task}</span>
  </div>`;
};

const editTasks = () => {
  canEditTasks = true;
  secondaryControlBox.hidden = !canEditTasks;

  document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => checkbox.hidden = false);
}

const toggleSelected = () => {
  document.querySelectorAll('.taskRemoveCheckbox').forEach(checkbox => checkbox.checked = (checkbox.checked ? false : true));
}

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

  hideTaskRemoveCheckboxes();
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

// Containers
const primaryControlBox = document.querySelector('#primary-control-box');
const secondaryControlBox = document.querySelector('#secondary-control-box');
const taskCon = document.querySelector('#task-con');
// Control Buttons
const addTaskBtn = document.querySelector('#add-task-btn');
const editTasksBtn = document.querySelector('#edit-tasks-btn');
const viewTasksBtn = document.querySelector('#view-tasks-btn');
const toggleSelectBtn = document.querySelector('#toggle-select-btn');
const removeSelectedBtn = document.querySelector('#remove-selected-btn');
const saveChangesBtn = document.querySelector('#save-changes-btn');

const currentDate = getCurrentDate();

let canEditTasks = false;

// Call Functions
updateCurrentDateText();

// Event Listeners
window.addEventListener('load', () => {
  checkLocalStorage();
  loadTasks();
});

document.addEventListener('change', e => updateIfTaskCompleteCheckboxChange(e));
addTaskBtn.addEventListener('click', addTask);
editTasksBtn.addEventListener('click', editTasks);
toggleSelectBtn.addEventListener('click', toggleSelected);
removeSelectedBtn.addEventListener('click', removeSelected);
saveChangesBtn.addEventListener('click', saveChanges);
