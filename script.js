// ================================
// REFERENCIAS AL DOM
// ================================
const inputTarea = document.getElementById("tarea");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora");
const selectPrioridad = document.getElementById("prioridad");
const btnAgregar = document.getElementById("btnAgregar");
const listaTareas = document.getElementById("listaTareas");
const totalTareas = document.getElementById("totalTareas");
const tareasCompletadas = document.getElementById("tareasCompletadas");
const filtros = document.querySelectorAll(".filtro");

// ================================
// ESTADO DE LA APLICACIÓN
// ================================
let tareas = [];
let filtroActivo = "todas";
let tareaEditandoId = null;

// ================================
// INICIALIZAR
// ================================
document.addEventListener("DOMContentLoaded", inicializar);

function inicializar() {
  cargarTareas();
  renderizarTareas();
  iniciarAlarma();
}

// ================================
// LOCALSTORAGE
// ================================
function cargarTareas() {
  const guardadas = localStorage.getItem("tareas");
  tareas = guardadas ? JSON.parse(guardadas) : [];
}

function guardarTareas() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

// ================================
// AGREGAR O EDITAR TAREA
// ================================
function agregarTarea() {
  const nombre = inputTarea.value.trim();
  const fecha = inputFecha.value;
  const hora = inputHora.value;
  const prioridad = selectPrioridad.value;

  if (!nombre) {
    alert("Por favor, ingresa el nombre de la tarea.");
    return;
  }

  if (tareaEditandoId !== null) {
    tareas = tareas.map(tarea => {
      if (tarea.id === tareaEditandoId) {
        return { ...tarea, nombre, fecha, hora, prioridad };
      }
      return tarea;
    });

    tareaEditandoId = null;
    btnAgregar.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar tarea';

  } else {
    const nuevaTarea = {
      id: Date.now(),
      nombre,
      fecha,
      hora,
      prioridad,
      completada: false 
    };

    tareas.push(nuevaTarea);
  }

  guardarTareas();
  renderizarTareas();
  limpiarFormulario();
}

function limpiarFormulario() {
  inputTarea.value = "";
  inputFecha.value = "";
  inputHora.value = "";
  selectPrioridad.value = "media";
}

btnAgregar.addEventListener("click", agregarTarea);

inputTarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregarTarea();
});

// ================================
// RENDERIZAR TAREAS
// ================================
function renderizarTareas() {
  let tareasFiltradas = tareas.filter(tarea => {
    if (filtroActivo === "todas") return true;
    if (filtroActivo === "completadas") return tarea.completada;
    if (filtroActivo === "pendientes") return !tarea.completada;
    return tarea.prioridad === filtroActivo;
  });

  listaTareas.innerHTML = "";

  if (tareasFiltradas.length === 0) {
    listaTareas.innerHTML = `
      <li class="sin-tareas">
        <i class="fa-solid fa-clipboard"></i>
        <p>No hay tareas aquí todavía</p>
      </li>
    `;
    actualizarContador();
    return;
  }

  tareasFiltradas.forEach(tarea => {
    const li = document.createElement("li");

    li.className = `tarea ${tarea.prioridad} ${tarea.completada ? "completada" : ""}`;
    li.dataset.id = tarea.id;

    const fechaFormateada = tarea.fecha
      ? new Date(tarea.fecha + "T00:00:00").toLocaleDateString("es-CO")
      : "Sin fecha";

    const horaFormateada = tarea.hora || "Sin hora";

    li.innerHTML = `
      <div class="tarea-info">
        <p class="tarea-nombre">${tarea.nombre}</p>
        <div class="tarea-meta">
          <span><i class="fa-regular fa-calendar"></i> ${fechaFormateada}</span>
          <span><i class="fa-regular fa-clock"></i> ${horaFormateada}</span>
          <span><i class="fa-solid fa-flag"></i> ${tarea.prioridad}</span>
        </div>
      </div>
      <div class="tarea-acciones">
        <button class="btn-accion btn-completar" title="Completar">
          <i class="fa-solid ${tarea.completada ? "fa-rotate-left" : "fa-check"}"></i>
        </button>
        <button class="btn-accion btn-editar" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-accion btn-eliminar" title="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    li.querySelector(".btn-completar").addEventListener("click", () => {
      completarTarea(tarea.id);
    });

    li.querySelector(".btn-editar").addEventListener("click", () => {
      editarTarea(tarea.id);
    });

    li.querySelector(".btn-eliminar").addEventListener("click", () => {
      eliminarTarea(tarea.id);
    });

    listaTareas.appendChild(li);
  });

  actualizarContador();
}

// ================================
// ACTUALIZAR CONTADOR
// ================================
function actualizarContador() {
  totalTareas.textContent = tareas.length;
  tareasCompletadas.textContent = tareas.filter(t => t.completada).length;
}

// ================================
// COMPLETAR TAREA
// ================================
function completarTarea(id) {
  tareas = tareas.map(tarea => {
    if (tarea.id === id) {
      return { ...tarea, completada: !tarea.completada }; 
    }
    return tarea;
  });
  guardarTareas();
  renderizarTareas();
}

// ================================
// ELIMINAR TAREA
// ================================
function eliminarTarea(id) {
  const confirmacion = confirm("¿Estás seguro de que quieres eliminar esta tarea?");
  if (!confirmacion) return;

  tareas = tareas.filter(tarea => tarea.id !== id);
  guardarTareas();
  renderizarTareas();
}

// ================================
// EDITAR TAREA
// ================================
function editarTarea(id) {
  const tarea = tareas.find(tarea => tarea.id === id);
  if (!tarea) return;

  inputTarea.value = tarea.nombre;
  inputFecha.value = tarea.fecha;
  inputHora.value = tarea.hora;
  selectPrioridad.value = tarea.prioridad;
  tareaEditandoId = id;
  btnAgregar.innerHTML = '<i class="fa-solid fa-pen"></i> Guardar cambios';
  window.scrollTo({ top: 0, behavior: "smooth" });
  inputTarea.focus();
}

// ================================
// FILTROS
// ================================
filtros.forEach(filtro => { 
  filtro.addEventListener("click", () => {
    filtros.forEach(f => f.classList.remove("activo"));
    filtro.classList.add("activo");
    filtroActivo = filtro.dataset.filtro;
    renderizarTareas();
  });
});

// ================================
// ALARMA
// ================================
function iniciarAlarma() {
  Notification.requestPermission();
  setInterval(revisarAlarmas, 60000);
  revisarAlarmas();
}

function revisarAlarmas() {
  const ahora = new Date();
  const fechaHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  const horaAhora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

  tareas.forEach(tarea => {
    if (
      tarea.fecha &&
      tarea.hora &&
      !tarea.completada && 
      tarea.fecha === fechaHoy &&
      tarea.hora === horaAhora
    ) {
      lanzarNotificacion(tarea);
    }
  });
}

function lanzarNotificacion(tarea) {
  const notificacion = document.createElement("div");
  notificacion.className = "notificacion-visual";
  notificacion.innerHTML = `
    <div class="notificacion-header">
      <h4 class="notificacion-titulo">⏰ ¡Es hora!</h4>
      <button class="btn-cerrar">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <p class="notificacion-cuerpo">${tarea.nombre} — Prioridad: ${tarea.prioridad}</p>
    <button class="btn-completar-notif">Marcar como completada</button>
  `;

  document.body.appendChild(notificacion);

  try {
    const audioCtx = new AudioContext();

    const oscillator = audioCtx.createOscillator();

    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(520, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 1
    );

    oscillator.start(audioCtx.currentTime);

    oscillator.stop(audioCtx.currentTime + 1);

  } catch (e) {
    console.log("Audio no disponible");
  }

  function cerrarNotificacion() {
    notificacion.classList.remove("show");
    setTimeout(() => notificacion.remove(), 400);
  }

  notificacion.querySelector(".btn-cerrar").addEventListener("click", () => {
    cerrarNotificacion();
  });

  notificacion.querySelector(".btn-completar-notif").addEventListener("click", () => {
    if (tarea.id) completarTarea(tarea.id);
    cerrarNotificacion();
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notificacion.classList.add("show");
    });
  });

  setTimeout(cerrarNotificacion, 10000);
}