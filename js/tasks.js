/**
 * tasks.js - Gestionnaire de tâches (To-Do List) et persistance
 */
let todos = [];
let selectedDateFilter = null;

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeDaysBadge(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Auj.', cls: 'today' };
  if (diffDays > 0) return { label: `J-${diffDays}`, cls: 'upcoming' };
  return { label: `J+${Math.abs(diffDays)}`, cls: 'overdue' };
}

function getTaskDatesMap() {
  const map = {};
  todos.forEach((t) => {
    if (t.date) {
      if (!map[t.date]) map[t.date] = { pending: 0, done: 0 };
      if (t.done) map[t.date].done++;
      else map[t.date].pending++;
    }
  });
  return map;
}

function getSelectedDateFilter() {
  return selectedDateFilter;
}

function setDateFilter(date) {
  selectedDateFilter = date;
  const todoDateInput = document.getElementById('todo-date');
  if (todoDateInput) {
    todoDateInput.value = date || '';
  }
  saveAndRenderTodos();
}

function saveAndRenderTodos() {
  localStorage.setItem('startpage_todos_v2', JSON.stringify(todos));

  if (typeof renderCalendar === 'function') {
    renderCalendar();
  }

  const todoListEl = document.getElementById('todo-list');
  const clearDateFilterBtn = document.getElementById('clear-date-filter');
  const filterDateLabel = document.getElementById('filter-date-label');

  if (clearDateFilterBtn && filterDateLabel) {
    if (selectedDateFilter) {
      const parts = selectedDateFilter.split('-');
      if (parts.length === 3) {
        filterDateLabel.textContent = `${parts[2]}/${parts[1]}`;
      }
      clearDateFilterBtn.hidden = false;
    } else {
      clearDateFilterBtn.hidden = true;
    }
  }

  if (!todoListEl) return;

  const visibleTodos = todos
    .map((t, index) => ({ ...t, originalIndex: index }))
    .filter((t) => !selectedDateFilter || t.date === selectedDateFilter);

  if (visibleTodos.length === 0) {
    todoListEl.innerHTML = `<li class="todo-empty">${
      selectedDateFilter ? 'Aucune tâche à cette date.' : 'Aucune tâche en cours.'
    }</li>`;
    return;
  }

  todoListEl.innerHTML = visibleTodos
    .map((t) => {
      const badge = computeDaysBadge(t.date);
      return `
        <li class="todo-item ${t.done ? 'done' : ''}">
          <label>
            <input type="checkbox" data-idx="${t.originalIndex}" ${t.done ? 'checked' : ''} />
            <span class="todo-text">${t.text}</span>
          </label>
          <div class="todo-right">
            ${badge ? `<span class="deadline-badge ${badge.cls}">${badge.label}</span>` : ''}
            <button class="todo-del" data-del="${t.originalIndex}" title="Supprimer">&times;</button>
          </div>
        </li>
      `;
    })
    .join('');
}

function initTasks() {
  try {
    todos = JSON.parse(localStorage.getItem('startpage_todos_v2') || '[]');
  } catch {
    todos = [];
  }

  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoDateInput = document.getElementById('todo-date');
  const todoListEl = document.getElementById('todo-list');
  const clearDateFilterBtn = document.getElementById('clear-date-filter');

  if (todoForm) {
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (!text) return;

      const chosenDate = todoDateInput.value || selectedDateFilter || '';
      todos.unshift({
        text,
        date: chosenDate,
        done: false
      });

      todoInput.value = '';
      saveAndRenderTodos();
    });
  }

  if (todoListEl) {
    todoListEl.addEventListener('click', (e) => {
      if (e.target.matches('input[type="checkbox"]')) {
        const idx = Number(e.target.dataset.idx);
        if (todos[idx]) {
          todos[idx].done = e.target.checked;
          saveAndRenderTodos();
        }
      } else if (e.target.matches('.todo-del')) {
        const idx = Number(e.target.dataset.del);
        if (todos[idx]) {
          todos.splice(idx, 1);
          saveAndRenderTodos();
        }
      }
    });
  }

  if (clearDateFilterBtn) {
    clearDateFilterBtn.addEventListener('click', () => {
      setDateFilter(null);
    });
  }

  saveAndRenderTodos();
}
