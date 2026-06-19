/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
const API = '/api';

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
let currentLevel   = 'primaria';
let currentGrade   = null;
let currentSection = 'A';
let currentCourse  = null;
let statusMap      = {};
let studentsCache  = [];
let attendanceIds  = {};

/* ============================================================
   UTILIDADES
   ============================================================ */
function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent  = msg;
  t.className    = 'toast show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} de ${months[parseInt(m)-1]} de ${y}`;
}

/* ============================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ============================================================ */
function goTo(dest) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  if (dest === 'selector' || dest === 'inicio') {
    document.getElementById('screen-selector').classList.add('active');
  } else if (dest === 'primaria' || dest === 'secundaria') {
    currentLevel = dest;
    document.getElementById('grade-level-title').textContent =
      dest === 'primaria' ? 'Primaria' : 'Secundaria';
    buildGradeChips();
    document.getElementById('screen-grade').classList.add('active');
  } else if (dest === 'grade') {
    document.getElementById('screen-grade').classList.add('active');
  } else if (dest === 'attendance') {
    document.getElementById('screen-attendance').classList.add('active');
  } else if (dest === 'history') {
    document.getElementById('screen-history').classList.add('active');
  }
}

/* ============================================================
   PANTALLA 2: CHIPS DE GRADO Y SECCIÓN
   ============================================================ */
function buildGradeChips() {
  const max  = currentLevel === 'primaria' ? 6 : 5;
  const cont = document.getElementById('grade-chips');
  cont.innerHTML = '';

  for (let i = 1; i <= max; i++) {
    const btn = document.createElement('button');
    btn.className     = 'chip chip-grade' + (i === 1 ? ' active-chip' : '');
    btn.dataset.grade = String(i);
    btn.textContent   = i + '°';
    btn.onclick       = () => selectGrade(String(i));
    cont.appendChild(btn);
  }

  document.querySelectorAll('.chip-sec').forEach(b => {
    b.onclick = () => selectSection(b.dataset.sec);
  });

  currentGrade   = '1';
  currentSection = 'A';
  markActiveChip('grade-chips',   '1', 'chip-grade');
  markActiveChip('section-chips', 'A', 'chip-sec');
  refreshGradeInfo();
}

function markActiveChip(containerId, value, chipClass) {
  document.querySelectorAll(`#${containerId} .${chipClass}`)
    .forEach(b => b.classList.toggle('active-chip',
      (b.dataset.grade || b.dataset.sec) === value));
}

function selectGrade(g) {
  currentGrade = g;
  markActiveChip('grade-chips', g, 'chip-grade');
  refreshGradeInfo();
}

function selectSection(s) {
  currentSection = s;
  markActiveChip('section-chips', s, 'chip-sec');
  refreshGradeInfo();
}

async function refreshGradeInfo() {
  const label = `${currentGrade}° ${currentSection} — ${currentLevel === 'primaria' ? 'Primaria' : 'Secundaria'}`;
  document.getElementById('gic-main').textContent  = label;
  document.getElementById('gic-sub').textContent   = 'Buscando alumnos…';
  document.getElementById('gic-badge').textContent = '…';

  try {
    const courses    = await apiFetch(`/api/courses?level=${currentLevel}`);
    const courseName = `${currentGrade}° ${currentSection}`;
    currentCourse    = courses.find(c =>
      c.name.trim().toLowerCase() === courseName.trim().toLowerCase()
    ) || null;

    if (!currentCourse) {
      document.getElementById('gic-sub').textContent   = 'No existe ese grado/sección en la base de datos';
      document.getElementById('gic-badge').textContent = '0 alumnos';
      return;
    }

    const students = await apiFetch(`/api/students/course/${currentCourse.id}`);
    document.getElementById('gic-sub').textContent   =
      currentCourse.teacher ? `Prof. ${currentCourse.teacher}` : 'Sin docente asignado';
    document.getElementById('gic-badge').textContent = `${students.length} alumnos`;
  } catch (e) {
    document.getElementById('gic-sub').textContent   = 'Error al cargar';
    document.getElementById('gic-badge').textContent = '—';
  }
}

/* ============================================================
   PANTALLA 3: REGISTRO DE ASISTENCIA
   ============================================================ */
async function enterAttendance() {
  if (!currentCourse) {
    showToast('Ese grado/sección no existe. Verifica la base de datos.', 'err');
    return;
  }

  goTo('attendance');

  const label = `${currentGrade}° ${currentSection} — ${currentLevel === 'primaria' ? 'Primaria' : 'Secundaria'}`;
  document.getElementById('att-title').textContent = label;
  document.getElementById('att-date').textContent  = fmtDate(todayISO());

  try {
    studentsCache = await apiFetch(`/api/students/course/${currentCourse.id}`);
    statusMap     = {};
    attendanceIds = {};

    const todayAtts = await apiFetch(`/api/attendance/date/${todayISO()}`);
    todayAtts.forEach(a => {
      if (studentsCache.some(s => s.id === a.studentId)) {
        statusMap[a.studentId]     = a.status;
        attendanceIds[a.studentId] = a.id;
      }
    });

    renderAttList(studentsCache);
    updateStats(studentsCache);
  } catch (e) {
    showToast('Error al cargar los datos', 'err');
  }
}

/* ============================================================
   MODO EDICIÓN
   ============================================================ */
let editMode = false;

function toggleEditMode() {
  editMode = !editMode;
  const bar     = document.getElementById('edit-mode-bar');
  const btnEdit = document.getElementById('btn-toggle-edit');

  if (bar) bar.style.display = editMode ? 'block' : 'none';
  btnEdit.classList.toggle('active-edit', editMode);
  btnEdit.textContent = editMode ? '✕ Salir edición' : '✏️ Editar lista';

  renderAttList(studentsCache);
  showToast(editMode ? '✏️ Modo edición activado' : '✅ Modo edición desactivado');
}

/* ============================================================
   RENDER LISTA DE ALUMNOS
   ============================================================ */
function renderAttList(students) {
  const list = document.getElementById('att-list');
  list.innerHTML = '';

  students.forEach((s, i) => {
    const status = statusMap[s.id] || 'ninguno';
    const div    = document.createElement('div');
    div.className = `att-row status-${status}${editMode ? ' edit-mode' : ''}`;
    div.id        = `row-${s.id}`;

    const editBtns = editMode ? `
      <button class="att-btn btn-edit" onclick="openEditStudent(${s.id})" title="Editar nombre">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="att-btn btn-del" onclick="confirmDeleteStudent(${s.id},'${s.name.replace(/'/g, "\\'")}')" title="Eliminar alumno">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>` : '';

    div.innerHTML = `
      <div class="att-num">${i + 1}</div>
      <div class="att-name">${s.name}</div>
      <div class="att-btns">
        <button class="att-btn btn-p ${status === 'presente' ? 'active' : ''}"
                onclick="setStatus(${s.id},'presente')">P</button>
        <button class="att-btn btn-a ${status === 'ausente'  ? 'active' : ''}"
                onclick="setStatus(${s.id},'ausente')">A</button>
        <button class="att-btn btn-t ${status === 'tardanza' ? 'active' : ''}"
                onclick="setStatus(${s.id},'tardanza')">T</button>
        ${editBtns}
      </div>`;
    list.appendChild(div);
  });
}

/* ============================================================
   MODAL AGREGAR / EDITAR ALUMNO
   ============================================================ */
function resetModalToAdd() {
  document.querySelector('.modal-header h3').textContent = '➕ Nuevo alumno';
  document.querySelector('.modal-btn-save').textContent  = 'Guardar alumno';
  document.querySelector('.modal-btn-save').onclick      = saveNewStudent;
}

function openAddStudent() {
  if (!currentCourse) { showToast('No hay sección seleccionada', 'err'); return; }
  document.getElementById('modal-course-name').textContent =
    `${currentGrade}° ${currentSection} — ${currentLevel === 'primaria' ? 'Primaria' : 'Secundaria'}`;
  document.getElementById('modal-student-name').value = '';
  resetModalToAdd();
  document.getElementById('modal-add-student').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-student-name').focus(), 100);
}

function closeAddStudent() {
  document.getElementById('modal-add-student').style.display = 'none';
  resetModalToAdd();
}

async function saveNewStudent() {
  const nameInput = document.getElementById('modal-student-name');
  const name      = nameInput.value.trim().toUpperCase();
  if (!name || name.length < 3) { showToast('Escribe el nombre completo', 'err'); nameInput.focus(); return; }

  const exists = studentsCache.some(s => s.name.trim().toUpperCase() === name);
  if (exists) { showToast('⚠️ Ese alumno ya existe en la lista', 'err'); return; }

  try {
    const nuevo = await apiFetch('/api/students', 'POST', {
      name, courseId: currentCourse.id, level: currentLevel
    }, 'Guardando alumno…');

    studentsCache.push(nuevo);
    statusMap[nuevo.id] = 'ninguno';
    renderAttList(studentsCache);
    updateStats(studentsCache);
    closeAddStudent();
    showToast(`✅ ${name} agregado a ${currentGrade}° ${currentSection}`);
  } catch (e) {
    showToast('Error al guardar: ' + e.message, 'err');
  }
}

function openEditStudent(id) {
  const student = studentsCache.find(s => s.id === id);
  if (!student) return;
  document.getElementById('modal-course-name').textContent =
    `${currentGrade}° ${currentSection} — ${currentLevel === 'primaria' ? 'Primaria' : 'Secundaria'}`;
  document.getElementById('modal-student-name').value = student.name;
  document.querySelector('.modal-header h3').textContent  = '✏️ Editar alumno';
  document.querySelector('.modal-btn-save').textContent   = 'Guardar cambios';
  document.querySelector('.modal-btn-save').onclick       = () => saveEditStudent(id);
  document.getElementById('modal-add-student').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-student-name').focus(), 100);
}

async function saveEditStudent(id) {
  const nameInput = document.getElementById('modal-student-name');
  const name      = nameInput.value.trim().toUpperCase();
  if (!name || name.length < 3) { showToast('Escribe el nombre completo', 'err'); nameInput.focus(); return; }

  const exists = studentsCache.some(s => s.name.trim().toUpperCase() === name && s.id !== id);
  if (exists) { showToast('⚠️ Ya existe un alumno con ese nombre', 'err'); return; }

  try {
    await apiFetch(`/api/students/${id}`, 'PUT', {
      name, courseId: currentCourse.id, level: currentLevel
    }, 'Guardando cambios…');

    const idx = studentsCache.findIndex(s => s.id === id);
    if (idx !== -1) studentsCache[idx].name = name;
    renderAttList(studentsCache);
    updateStats(studentsCache);
    closeAddStudent();
    showToast('✏️ Nombre actualizado correctamente');
  } catch (e) {
    showToast('Error al editar: ' + e.message, 'err');
  }
}

/* ============================================================
   ELIMINAR ALUMNO
   ============================================================ */
function confirmDeleteStudent(id, name) {
  document.getElementById('modal-del-name').textContent = name;
  document.getElementById('modal-delete').style.display = 'flex';
  document.getElementById('btn-confirm-del').onclick    = () => deleteStudent(id, name);
}

function closeDeleteModal() {
  document.getElementById('modal-delete').style.display = 'none';
}

async function deleteStudent(id, name) {
  try {
    await apiFetch(`/api/students/${id}`, 'DELETE', null, 'Eliminando alumno…');
    studentsCache = studentsCache.filter(s => s.id !== id);
    delete statusMap[id];
    delete attendanceIds[id];
    renderAttList(studentsCache);
    updateStats(studentsCache);
    closeDeleteModal();
    showToast(`🗑️ ${name} eliminado de la lista`);
  } catch (e) {
    showToast('Error al eliminar: ' + e.message, 'err');
  }
}

/* ============================================================
   CERRAR MODALES AL CLICK FUERA
   ============================================================ */
document.getElementById('modal-add-student').addEventListener('click', function(e) {
  if (e.target === this) closeAddStudent();
});
document.getElementById('modal-delete').addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

/* ============================================================
   ASISTENCIA: ESTADO Y STATS
   ============================================================ */
function setStatus(studentId, status) {
  statusMap[studentId] = status;
  const row = document.getElementById(`row-${studentId}`);
  if (row) {
    row.className = `att-row status-${status}${editMode ? ' edit-mode' : ''}`;
    row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active'));
    const map = { presente: 'btn-p', ausente: 'btn-a', tardanza: 'btn-t' };
    row.querySelector('.' + map[status])?.classList.add('active');
  }
  updateStats(studentsCache);
}

function markAll(status) {
  studentsCache.forEach(s => { statusMap[s.id] = status; });
  renderAttList(studentsCache);
  updateStats(studentsCache);
}

function updateStats(students) {
  const total     = students.length;
  const presentes = students.filter(s => statusMap[s.id] === 'presente').length;
  const ausentes  = students.filter(s => statusMap[s.id] === 'ausente').length;
  const tardanzas = students.filter(s => statusMap[s.id] === 'tardanza').length;
  const pct       = total > 0 ? Math.round((presentes + tardanzas) / total * 100) : 0;

  document.getElementById('st-total').textContent = total;
  document.getElementById('st-pres').textContent  = presentes;
  document.getElementById('st-aus').textContent   = ausentes;
  document.getElementById('st-tard').textContent  = tardanzas;
  document.getElementById('st-pct').textContent   = total > 0 ? pct + '%' : '—';
}

/* ============================================================
   GUARDAR ASISTENCIAS
   ============================================================ */
async function saveAttendance() {
  if (!studentsCache.length) { showToast('No hay alumnos cargados', 'err'); return; }

  const date = todayISO();
  let ok = 0, err = 0;

  const promises = studentsCache.map(async s => {
    const status = statusMap[s.id] || 'ninguno';
    if (status === 'ninguno') return;
    try {
      if (attendanceIds[s.id]) {
        await apiFetch(`/api/attendance/${attendanceIds[s.id]}`, 'PUT', { status, date, studentId: s.id });
      } else {
        const created = await apiFetch('/api/attendance', 'POST', { status, date, studentId: s.id });
        attendanceIds[s.id] = created.id;
      }
      ok++;
    } catch (e) { err++; }
  });

  await Promise.all(promises);
  showToast(err === 0 ? `✅ ${ok} asistencias guardadas` : `⚠️ ${ok} guardadas, ${err} con error`, err > 0 ? 'err' : 'ok');
}

/* ============================================================
   EXPORTAR EXCEL
   ============================================================ */
function exportAttendance() {
  if (!studentsCache.length) { showToast('No hay datos para exportar', 'err'); return; }

  const rows = studentsCache.map((s, i) => ({
    '#':       i + 1,
    'Nombre':  s.name,
    'Estado':  statusMap[s.id] || 'sin marcar',
    'Fecha':   todayISO(),
    'Grado':   `${currentGrade}° ${currentSection}`,
    'Nivel':   currentLevel,
    'Docente': currentCourse?.teacher || ''
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
  XLSX.writeFile(wb, `asistencia_${currentLevel}_${currentGrade}${currentSection}_${todayISO()}.xlsx`);
  showToast('📥 Archivo Excel descargado');
}

/* ============================================================
   EXTRACTOR DE ALUMNOS DESDE HOJA EXCEL
   ============================================================ */
function extractStudentsFromSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const students = [];
  const seen = new Set();

  // Estrategia 1: col B = número orden, col C = nombre
  for (const row of rows) {
    const num  = row[1];
    const name = row[2];
    if (
      typeof num  === 'number' && num >= 1 &&
      typeof name === 'string' && name.trim().length > 3 &&
      !name.toLowerCase().includes('apellido') &&
      !name.toLowerCase().includes('nombre') &&
      !name.toLowerCase().includes('alumno')
    ) {
      const clean = name.trim();
      if (!seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        students.push(clean);
      }
    }
  }
  if (students.length > 0) return students;

  // Estrategia 2: encabezados SIAGIE / CSV simple
  const headerKeywords = ['apellido', 'nombre', 'name', 'alumno'];
  let nameColIndex = -1;
  let dataStartRow = -1;

  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (headerKeywords.some(k => cell.includes(k))) {
        nameColIndex = c;
        dataStartRow = r + 1;
        break;
      }
    }
    if (nameColIndex !== -1) break;
  }

  if (nameColIndex !== -1) {
    for (let r = dataStartRow; r < rows.length; r++) {
      const name = rows[r][nameColIndex];
      if (typeof name === 'string' && name.trim().length > 3) {
        const clean = name.trim();
        if (!seen.has(clean.toLowerCase())) {
          seen.add(clean.toLowerCase());
          students.push(clean);
        }
      }
    }
  }

  return students;
}

/* ============================================================
   PARSER NOMBRE DE HOJA → { grade, section }
   ============================================================ */
function parseSheetName(name) {
  const n = name.trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const words = {
    'primero': 1, 'segundo': 2, 'tercero': 3,
    'cuarto':  4, 'quinto':  5, 'sexto':   6,
    'primer':  1, 'tercer':  3
  };

  let grade = null, section = null;

  const numMatch = n.match(/^(\d)[°º]?\s*([a-f])/);
  if (numMatch) {
    grade   = parseInt(numMatch[1]);
    section = numMatch[2].toUpperCase();
  } else {
    for (const [word, num] of Object.entries(words)) {
      if (n.includes(word)) { grade = num; break; }
    }
    const secMatch = n.match(/\b([a-f])\b/);
    if (secMatch) section = secMatch[1].toUpperCase();
  }

  if (!grade || !section || grade < 1 || grade > 6) return null;
  return { grade, section };
}

/* ============================================================
   IMPORTAR EXCEL — PANTALLA PRINCIPAL (modo global)
   ============================================================ */
async function handleFileImport(input) {
  const file = input.files[0];
  if (!file) return;

  let wb;
  try {
    const data = await file.arrayBuffer();
    wb = XLSX.read(data, { type: 'array' });
  } catch (e) {
    showToast('Archivo inválido o corrupto', 'err');
    return;
  }

  let courses;
  try {
    courses = await apiFetch('/api/courses?level=primaria');
  } catch (e) {
    showToast('Error al conectar con la base de datos', 'err');
    return;
  }

  const validSheets = wb.SheetNames.filter(sn =>
    extractStudentsFromSheet(wb.Sheets[sn]).length > 0
  );

  if (validSheets.length === 0) {
    showToast('No se encontraron alumnos en el archivo', 'err');
    input.value = '';
    return;
  }

  let totalOk = 0, totalSkip = 0, totalErr = 0;
  const log = [];

  for (const sheetName of validSheets) {
    const parsed = parseSheetName(sheetName);

    if (!parsed) {
      const names = extractStudentsFromSheet(wb.Sheets[sheetName]);
      log.push(`⚠️ Hoja "<b>${sheetName}</b>": ${names.length} alumnos detectados pero no se reconoció el grado/sección.`);
      continue;
    }

    const { grade, section } = parsed;
    const courseName = `${grade}° ${section}`;
    const course = courses.find(c =>
      c.name.trim().toLowerCase() === courseName.trim().toLowerCase()
    );
    if (!course) {
      log.push(`⚠️ <b>${courseName}</b> (hoja "${sheetName}"): no existe en la base de datos`);
      continue;
    }

    const names = extractStudentsFromSheet(wb.Sheets[sheetName]);
    let existing = [];
    try { existing = await apiFetch(`/api/students/course/${course.id}`); } catch (_) {}

    const existingNames = new Set(existing.map(s => s.name.trim().toLowerCase()));
    let ok = 0, skip = 0;

    for (const nameClean of names) {
      if (existingNames.has(nameClean.toLowerCase())) { skip++; continue; }
      try {
        await apiFetch('/api/students', 'POST', {
          name: nameClean, courseId: course.id, level: 'primaria'
        });
        existingNames.add(nameClean.toLowerCase());
        ok++;
      } catch (_) { totalErr++; }
    }

    totalOk   += ok;
    totalSkip += skip;
    log.push(`✅ <b>${courseName}</b>: ${ok} importados, ${skip} ya existían`);
  }

  const preview = document.getElementById('import-preview');
  if (preview) {
    preview.style.display = 'block';
    preview.innerHTML =
      `<b>Importación completada</b><br>` +
      `✅ ${totalOk} alumnos nuevos &nbsp;|&nbsp; ➖ ${totalSkip} duplicados &nbsp;|&nbsp; ❌ ${totalErr} errores<br><br>` +
      log.join('<br>');
  }

  showToast(totalOk > 0 ? `✅ ${totalOk} alumnos importados` : '➖ Sin alumnos nuevos');
  input.value = '';
}

/* ============================================================
   IMPORTAR EXCEL — PANTALLA DE GRADO (modo individual)
   ============================================================ */
async function handleGradeImport(input) {
  const file = input.files[0];
  if (!file) { showToast('Selecciona un archivo', 'err'); return; }
  if (!currentCourse) { showToast('Selecciona primero un grado/sección válido', 'err'); return; }

  let wb;
  try {
    const data = await file.arrayBuffer();
    wb = XLSX.read(data, { type: 'array' });
  } catch (e) {
    showToast('Archivo inválido o corrupto', 'err');
    return;
  }

  const expectedName = `${currentGrade}° ${currentSection}`.toLowerCase();
  let targetSheetName = wb.SheetNames.find(sn => {
    const p = parseSheetName(sn);
    return p && `${p.grade}° ${p.section}`.toLowerCase() === expectedName;
  });

  if (!targetSheetName) {
    targetSheetName = wb.SheetNames.find(sn =>
      extractStudentsFromSheet(wb.Sheets[sn]).length > 0
    );
  }

  if (!targetSheetName) {
    showToast('No se encontraron alumnos en el archivo', 'err');
    input.value = '';
    return;
  }

  const names = extractStudentsFromSheet(wb.Sheets[targetSheetName]);
  if (!names.length) {
    showToast('El archivo no contiene alumnos reconocibles', 'err');
    input.value = '';
    return;
  }

  const existingNames = new Set(studentsCache.map(s => s.name.trim().toLowerCase()));
  let ok = 0, skip = 0;

  for (const nameClean of names) {
    if (existingNames.has(nameClean.toLowerCase())) { skip++; continue; }
    try {
      await apiFetch('/api/students', 'POST', {
        name: nameClean, courseId: currentCourse.id, level: currentLevel
      });
      existingNames.add(nameClean.toLowerCase());
      ok++;
    } catch (_) { /* ignorar */ }
  }

  showToast(ok > 0
    ? `✅ ${ok} alumnos importados a ${currentGrade}° ${currentSection}${skip ? ` (${skip} ya existían)` : ''}`
    : `➖ Sin alumnos nuevos — ${skip} ya existían`);

  refreshGradeInfo();
  input.value = '';
}

/* ============================================================
   HELPER API FETCH
   ============================================================ */
async function apiFetch(url, method = 'GET', body = null, loadingMsg = null) {
  const overlay     = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');

  if (loadingMsg && overlay) {
    loadingText.textContent = loadingMsg;
    overlay.style.display   = 'flex';
  }

  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    if (overlay) overlay.style.display = 'none';
  }
}

/* ============================================================
   HELPER: getStudents (usado por el chat)
   ============================================================ */
function getStudents() {
  return studentsCache;
}

/* ============================================================
   HISTORIAL DE ASISTENCIA (solo lectura, por fecha)
   ============================================================ */
function enterHistory() {
  if (!currentCourse) { showToast('Selecciona primero un grado/sección', 'err'); return; }

  document.getElementById('hist-course-label').textContent =
    `${currentGrade}° ${currentSection} — ${currentLevel === 'primaria' ? 'Primaria' : 'Secundaria'}`;

  const dateInput = document.getElementById('hist-date-input');
  dateInput.value = todayISO();
  dateInput.max   = todayISO(); // no se puede ver "futuro"

  goTo('history');
  loadHistoryDate(todayISO());
}

async function loadHistoryDate(dateStr) {
  if (!dateStr || !currentCourse) return;

  const listEl  = document.getElementById('hist-list');
  const statsEl = document.getElementById('hist-stats-bar');
  listEl.innerHTML  = '<div class="hist-empty">Cargando… ⏳</div>';
  statsEl.innerHTML = '';

  try {
    const atts = await apiFetch(`/api/attendance/date/${dateStr}`);
    const idsEnCurso = new Set(studentsCache.map(s => s.id));
    const map = {};
    atts.forEach(a => { if (idsEnCurso.has(a.studentId)) map[a.studentId] = a.status; });

    const conRegistro = studentsCache.filter(s => map[s.id]);

    if (conRegistro.length === 0) {
      listEl.innerHTML = `<div class="hist-empty">🗒️ No hay asistencia guardada para el ${fmtDate(dateStr)}.</div>`;
      return;
    }

    const presentes = studentsCache.filter(s => map[s.id] === 'presente').length;
    const ausentes  = studentsCache.filter(s => map[s.id] === 'ausente').length;
    const tardanzas = studentsCache.filter(s => map[s.id] === 'tardanza').length;
    const pct       = studentsCache.length > 0
      ? Math.round((presentes + tardanzas) / studentsCache.length * 100) : 0;

    statsEl.innerHTML = `
      <div class="hist-stat hs-pres"><span>${presentes}</span>Presentes</div>
      <div class="hist-stat hs-aus"><span>${ausentes}</span>Ausentes</div>
      <div class="hist-stat hs-tard"><span>${tardanzas}</span>Tardanzas</div>
      <div class="hist-stat hs-pct"><span>${pct}%</span>Asistencia</div>
    `;

    const stickers = { presente: '⭐', ausente: '🌧️', tardanza: '⏰' };
    const labels    = { presente: 'Presente', ausente: 'Ausente', tardanza: 'Tardanza' };

    listEl.innerHTML = studentsCache.map((s, i) => {
      const status = map[s.id];
      if (!status) {
        return `<div class="hist-row hist-row-empty">
          <div class="hist-num">${i + 1}</div>
          <div class="hist-name">${s.name}</div>
          <div class="hist-sticker">➖</div>
        </div>`;
      }
      return `<div class="hist-row hist-${status}">
        <div class="hist-num">${i + 1}</div>
        <div class="hist-name">${s.name}</div>
        <div class="hist-sticker" title="${labels[status]}">${stickers[status]}</div>
      </div>`;
    }).join('');

  } catch (e) {
    listEl.innerHTML = '<div class="hist-empty">⚠️ Error al cargar el historial.</div>';
  }
}

/* ============================================================
   CHAT FLOTANTE
   ============================================================ */
let floatOpen    = false;
let fcHasGreeted = false;

function toggleFloatChat() {
  floatOpen = !floatOpen;
  const panel    = document.getElementById('float-chat');
  const fabOpen  = document.querySelector('.fab-open');
  const fabClose = document.querySelector('.fab-close');
  const badge    = document.getElementById('fab-badge');

  panel.classList.toggle('open', floatOpen);
  fabOpen.style.display  = floatOpen ? 'none' : 'flex';
  fabClose.style.display = floatOpen ? 'flex' : 'none';
  badge.style.display    = 'none';

  if (floatOpen && !fcHasGreeted) {
    fcHasGreeted = true;
    setTimeout(() => {
      fcAddMsg('bot', '¡Hola! 👋 Soy tu asistente. Puedo ayudarte a controlar las asistencias con comandos de texto.<br><br>Por ejemplo:<br>'
        + '<span class="fc-action-pill" onclick="fcQuick(\'Pon todos presentes\')">Pon todos presentes</span>'
        + '<span class="fc-action-pill" onclick="fcQuick(\'Marca a Juan como ausente\')">Marca a Juan ausente</span>'
        + '<span class="fc-action-pill" onclick="fcQuick(\'¿Qué puedes hacer?\')">¿Qué puedes hacer?</span>');
    }, 300);
  }

  if (floatOpen) setTimeout(() => document.getElementById('fc-input').focus(), 350);
}

function fcAddMsg(type, html) {
  const container = document.getElementById('fc-messages');
  const div = document.createElement('div');
  div.className = 'fc-msg ' + type;
  div.innerHTML = type === 'bot'
    ? `<div class="fc-bot-icon">🤖</div><div class="fc-bubble">${html}</div>`
    : `<div class="fc-bubble">${html}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function fcShowTyping() {
  const container = document.getElementById('fc-messages');
  const div = document.createElement('div');
  div.className = 'fc-msg bot';
  div.id        = 'fc-typing';
  div.innerHTML = `<div class="fc-bot-icon">🤖</div><div class="fc-bubble fc-typing"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function fcRemoveTyping() {
  document.getElementById('fc-typing')?.remove();
}

function fcSend() {
  const input = document.getElementById('fc-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  fcQuick(text);
}

function fcQuick(text) {
  fcAddMsg('user', text);
  document.getElementById('fc-suggestions').style.display = 'none';
  fcShowTyping();
  setTimeout(() => {
    fcRemoveTyping();
    fcAddMsg('bot', fcGetResponse(text));
  }, 600);
}

function fcGetResponse(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const enAsistencias = document.getElementById('screen-attendance').classList.contains('active');

  if (q.includes('que puedes') || q.includes('ayuda') || q.includes('comandos')) {
    return `Puedo hacer estas cosas:<br><br>
<b>📋 Asistencia:</b><br>
<span class="fc-action-pill" onclick="fcQuick('Pon todos presentes')">Todos presentes</span>
<span class="fc-action-pill" onclick="fcQuick('Pon todos ausentes')">Todos ausentes</span>
<span class="fc-action-pill" onclick="fcQuick('Limpia todo')">Limpiar todo</span><br><br>
<b>👤 Por alumno:</b><br>
<span class="fc-action-pill" onclick="fcQuick('Marca a [nombre] como presente')">Marcar presente</span>
<span class="fc-action-pill" onclick="fcQuick('Marca a [nombre] como ausente')">Marcar ausente</span>
<span class="fc-action-pill" onclick="fcQuick('Marca a [nombre] como tardanza')">Marcar tardanza</span><br><br>
<b>📊 Consultas:</b><br>
<span class="fc-action-pill" onclick="fcQuick('Resumen del día')">Resumen</span>
<span class="fc-action-pill" onclick="fcQuick('¿Quiénes faltan?')">Ausentes</span>
<span class="fc-action-pill" onclick="fcQuick('¿Quiénes llegaron tarde?')">Tardanzas</span><br><br>
<b>💾 Acciones:</b><br>
<span class="fc-action-pill" onclick="fcQuick('Guardar asistencias')">Guardar</span>
<span class="fc-action-pill" onclick="fcQuick('Exportar lista')">Exportar Excel</span>`;
  }

  if (!enAsistencias) {
    if (q.includes('primaria') && (q.includes('ir') || q.includes('abrir') || q.includes('entrar') || q.includes('ve a'))) {
      setTimeout(() => goTo('primaria'), 400);
      return '¡Vamos a Primaria! 🎒';
    }
    if (q.includes('secundaria') && (q.includes('ir') || q.includes('abrir') || q.includes('entrar') || q.includes('ve a'))) {
      setTimeout(() => goTo('secundaria'), 400);
      return '¡Vamos a Secundaria! 🎓';
    }
    return 'Entra primero a una lista de asistencia para usar los comandos. '
      + '<span class="fc-action-pill" onclick="fcQuick(\'Ir a primaria\')">Ir a Primaria</span> '
      + '<span class="fc-action-pill" onclick="fcQuick(\'Ir a secundaria\')">Ir a Secundaria</span>';
  }

  const students = getStudents();

  if ((q.includes('todos') || q.includes('tod@s')) && q.includes('present')) {
    markAll('presente');
    return `✅ Marqué a los ${students.length} alumnos como <b>presentes</b>.`;
  }
  if ((q.includes('todos') || q.includes('tod@s')) && q.includes('ausent')) {
    markAll('ausente');
    return `❌ Marqué a los ${students.length} alumnos como <b>ausentes</b>.`;
  }
  if (q.includes('limpiar') || q.includes('reiniciar') || q.includes('borrar todo') || q.includes('limpia')) {
    markAll('ninguno');
    return '🔄 Lista reiniciada.';
  }

  if (q.includes('marca') || q.includes('pon a') || q.includes('cambia a')) {
    let targetStatus = null;
    if (q.includes('present'))                             targetStatus = 'presente';
    else if (q.includes('ausent') || q.includes('falt'))   targetStatus = 'ausente';
    else if (q.includes('tard'))                           targetStatus = 'tardanza';

    if (targetStatus) {
      const matched = findStudentByName(q, students);
      if (matched.length === 1) {
        setStatus(matched[0].id, targetStatus);
        const icons = { presente: '✅', ausente: '❌', tardanza: '⏰' };
        return `${icons[targetStatus]} <b>${matched[0].name}</b> marcado como <b>${targetStatus}</b>.`;
      } else if (matched.length > 1) {
        return `Encontré ${matched.length} alumnos: ${matched.map(s =>
          `<span class="fc-action-pill" onclick="fcMarkStudent(${s.id},'${targetStatus}')">${s.name}</span>`
        ).join('')} ¿Cuál?`;
      } else {
        return `No encontré ese alumno.<br>${students.map(s =>
          `<span class="fc-action-pill" onclick="fcMarkStudent(${s.id},'${targetStatus}')">${s.name.split(' ')[0]}</span>`
        ).join('')}`;
      }
    }
  }

  const presentes = students.filter(s => statusMap[s.id] === 'presente');
  const ausentes  = students.filter(s => statusMap[s.id] === 'ausente');
  const tardanzas = students.filter(s => statusMap[s.id] === 'tardanza');
  const sinMarcar = students.filter(s => !statusMap[s.id] || statusMap[s.id] === 'ninguno');
  const pct       = students.length > 0 ? Math.round((presentes.length + tardanzas.length) / students.length * 100) : 0;

  if (q.includes('resumen') || q.includes('reporte') || q.includes('como vamos') || q.includes('como esta')) {
    return `📊 <b>Resumen actual</b><br>
✅ Presentes: <b>${presentes.length}</b><br>
❌ Ausentes: <b>${ausentes.length}</b><br>
⏰ Tardanzas: <b>${tardanzas.length}</b><br>
📋 Sin marcar: <b>${sinMarcar.length}</b><br>
📈 Asistencia: <b>${pct}%</b>`;
  }
  if (q.includes('falt') || q.includes('ausent') || q.includes('quienes no')) {
    if (!ausentes.length) return '¡Sin ausentes hoy! 🎉';
    return `❌ <b>Ausentes (${ausentes.length}):</b><br>${ausentes.map(s => `• ${s.name}`).join('<br>')}`;
  }
  if (q.includes('tard') || q.includes('llegaron tarde') || q.includes('retraso')) {
    if (!tardanzas.length) return '⏰ Nadie llegó tarde hoy.';
    return `⏰ <b>Tardanzas (${tardanzas.length}):</b><br>${tardanzas.map(s => `• ${s.name}`).join('<br>')}`;
  }
  if (q.includes('present') && (q.includes('quienes') || q.includes('lista') || q.includes('quien'))) {
    if (!presentes.length) return 'Aún no hay presentes registrados.';
    return `✅ <b>Presentes (${presentes.length}):</b><br>${presentes.map(s => `• ${s.name}`).join('<br>')}`;
  }
  if (q.includes('sin marcar') || q.includes('pendiente')) {
    if (!sinMarcar.length) return '¡Todo registrado!';
    return `📋 <b>Sin marcar (${sinMarcar.length}):</b><br>${sinMarcar.map(s => `• ${s.name}`).join('<br>')}`;
  }
  if (q.includes('cuantos') || q.includes('total') || q.includes('cuántos')) {
    return `Hay <b>${students.length} alumnos</b> en esta lista.`;
  }
  if (q.includes('guarda') || q.includes('guardar')) {
    saveAttendance();
    return '💾 Guardando asistencias…';
  }
  if (q.includes('export') || q.includes('excel') || q.includes('descargar')) {
    exportAttendance();
    return '📥 Exportando archivo Excel…';
  }

  const encontrado = findStudentByName(q, students);
  if (encontrado.length === 1) {
    const s  = encontrado[0];
    const st = statusMap[s.id] || 'sin marcar';
    return `👤 <b>${s.name}</b>: <b>${st}</b><br>
<span class="fc-action-pill" onclick="fcMarkStudent(${s.id},'presente')">✅ Presente</span>
<span class="fc-action-pill" onclick="fcMarkStudent(${s.id},'ausente')">❌ Ausente</span>
<span class="fc-action-pill" onclick="fcMarkStudent(${s.id},'tardanza')">⏰ Tardanza</span>`;
  }

  return `No entendí el comando. Prueba con:<br>
<span class="fc-action-pill" onclick="fcQuick('Pon todos presentes')">Todos presentes</span>
<span class="fc-action-pill" onclick="fcQuick('Resumen del día')">Resumen</span>
<span class="fc-action-pill" onclick="fcQuick('¿Qué puedes hacer?')">Ver comandos</span>`;
}

function findStudentByName(query, students) {
  const q = query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return students.filter(s => {
    const name  = s.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const parts = name.split(' ');
    return parts.some(p => q.includes(p) && p.length > 2);
  });
}

function fcMarkStudent(id, status) {
  setStatus(id, status);
  const s     = studentsCache.find(x => x.id === id);
  const icons = { presente: '✅', ausente: '❌', tardanza: '⏰' };
  fcAddMsg('bot', `${icons[status]} <b>${s ? s.name : 'Alumno'}</b> marcado como <b>${status}</b>.`);
}

window.addEventListener('load', () => {
  const badge = document.getElementById('fab-badge');
  if (badge) badge.style.display = 'flex';
});