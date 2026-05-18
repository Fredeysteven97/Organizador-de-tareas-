
const inputTarea = document.getElementById("tarea");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora");
const selectPrioridad = document.getElementById("prioridad");
const btnAgregar = document.getElementById("btnAgregar");
const listaTareas = document.getElementById("listaTareas");
const totalTareas = document.getElementById("totalTareas");
const tareasCompletadas = document.getElementById("tareasCompletadas");
const filtros = document.querySelectorAll(".filtro");

let tareas = [];
let filtroActivo = "todas";
let tareaEditandoId = null;

function cargarTareas() {
  const guardadas = localStorage.getItem("tareas");
  tareas = guardadas ? JSON.parse(guardadas) : [];
}

function guardarTareas() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function inicializar() {
  cargarTareas();
  renderizarTareas();
  iniciarAlarma();
}

document.addEventListener("DOMContentLoaded", inicializar);

function agregarTarea() {
  const nombre = inputTarea.value.trim();
  const fecha = inputFecha.value;
  const hora = inputHora.value;
  const prioridad = selectPrioridad.value;                            
}

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
    tareasCompletadas: false
  };

  tareas.push(nuevaTarea);
}

guardarTareas();
renderizarTareas();
limpiarFormulario();

function limpiarFormulario() {
  inputTarea.value = "";
  inputFecha.value = "";
  inputHora.value = "";
  selectPrioridad.value = "media";
}

btnAgregar.addEventListener("click", agregarTarea);

inputTarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    agregarTarea();
  }
});

function renderizarTareas() {
  let tareasFiltradas = tareas.filter(tarea => {
    if (filtroActivo === "todas") return true;
    if (filtroActivo === "completadas") return tarea.tareasCompletadas;
    if (filtroActivo === "pendientes") return !tarea.tareasCompletadas;
    return tarea.prioridad === filtroActivo;
  });
}

listaTareas.innerHTML = "";

if (tareasFiltradas.length === 0) {
  listaTareas.innerHTML =`
    <li class="sin-tareas">
        <i class="fa-solid fa-clipboard"></i>
        <p>No hay tareas aquí todavía</p>
    </li>
  `;
  actualizarContadores();
  return;
}

tareasFiltradas.forEach(tarea => {
  const li = document.createElement("li");

  li.className = `tarea ${tarea.prioridad} ${tarea.tareasCompletadas ? "completada" : ""}`;
  li.dataset.id = tarea.id; });

  const fechaFormateada = tarea.fecha
   ? new Date(tarea.fecha +"T00:00:00").toLocaleDateString("es-CO") : "sin fecha";

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

function actualizarContadores() {
  totalTareas.textContent = tareas.length;
  tareasCompletadas.textContent = tareas.filter(t => t.tareasCompletadas).length;
}

function completarTarea(id) {
  tareas = tareas.map(tarea => { 
    if (tarea.id === id) {
      return { ...tarea, tareasCompletadas: !tarea.tareasCompletadas };
    }
    return tarea;
  });
  guardarTareas();
  renderizarTareas();
}

function eliminarTarea(id) {
  const confirmacion = confirm("¿Estás seguro de que quieres eliminar esta tarea?");
  if (!confirmacion) return;

  tareas = tareas.filter(tarea => tarea.id !== id);
  guardarTareas();
  renderizarTareas();
}

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

filtrqos.forEach(filtro => {
  filtro.addEventListener("click", () => {
    filtros.forEach(f => f.classList.remove("activo"));
    filtro.classList.add("activo");
    filtroActivo = filtro.dataset.filtro;
    renderizarTareas();
  });
});

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
      !tarea.tareasCompletadas &&
      tarea.fecha === fechaHoy &&
      tarea.hora === horaAhora  
    ) {
      lanzarNotificacion(tarea);
  }
  });
}

function lanzarNotificacion(tarea) {
  if (Notification.permission === "granted") {
     const notificacion = new Notification(`⏰ TaskAlert`, {
      body: `¡Es hora de: ${tarea.nombre}! - Prioridad: ${tarea.prioridad}`,
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
    });
    setTimeout(() => {
      notificacion.close();
    }, 5000); 
  }
  } 