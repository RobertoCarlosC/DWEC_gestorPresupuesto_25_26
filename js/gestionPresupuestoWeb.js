import * as gp from './gestionPresupuesto.js';

const API_BASE = "https://gestion-presupuesto-api.onrender.com/api";



function mostrarDatoEnId(idElemento, valor) {
  const elemento = document.getElementById(idElemento);
  if (elemento) {
    elemento.textContent = valor;
  }
}

function obtenerUsuarioApi() {
  const input = document.getElementById("nombre_usuario");
  if (!input) return "";
  return input.value.trim().replace(/\s+/g, "");
}

function esGastoApi(gasto) {
  return gasto && typeof gasto.id === "string" && gasto.id.length > 0;
}


function mostrarGastoWeb(idContenedor, datosGasto) {
    let contenedor = document.getElementById(idContenedor);

    let bloqueGasto = document.createElement('div');
    bloqueGasto.classList.add('gasto');
    contenedor.appendChild(bloqueGasto);

    let descripcion = document.createElement('div');
    descripcion.classList.add('gasto-descripcion');
    descripcion.textContent = datosGasto.descripcion;
    bloqueGasto.appendChild(descripcion);

    let fecha = document.createElement('div');
    fecha.classList.add('gasto-fecha');
    fecha.textContent = new Date(datosGasto.fecha).toLocaleDateString();
    bloqueGasto.appendChild(fecha);

    let valor = document.createElement('div');
    valor.classList.add('gasto-valor');
    valor.textContent = datosGasto.valor;
    bloqueGasto.appendChild(valor);

    let etiquetas = document.createElement('div');
    etiquetas.classList.add('gasto-etiquetas');
    bloqueGasto.appendChild(etiquetas);

    if (datosGasto.etiquetas && datosGasto.etiquetas.length > 0) {
        for (let etiqueta of datosGasto.etiquetas) {
            let etiquetaSpan = document.createElement('span');
            etiquetaSpan.classList.add('gasto-etiquetas-etiqueta');
            etiquetaSpan.textContent = etiqueta;
            etiquetas.appendChild(etiquetaSpan);

            let manejadorBorrarEtiquetas = new BorrarEtiquetasHandle();
            manejadorBorrarEtiquetas.gasto = datosGasto;
            manejadorBorrarEtiquetas.etiqueta = etiqueta;
            etiquetaSpan.addEventListener("click", manejadorBorrarEtiquetas);
        }
    }


    let botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.classList.add("gasto-editar");
    botonEditar.type = "button";
    let manejadorEditar = new EditarHandle();
    manejadorEditar.gasto = datosGasto;
    botonEditar.addEventListener("click", manejadorEditar);
    bloqueGasto.appendChild(botonEditar);

    let botonBorrar = document.createElement("button");
    botonBorrar.textContent = "Borrar";
    botonBorrar.classList.add("gasto-borrar");
    botonBorrar.type = "button";
    let manejadorBorrar = new BorrarHandle();
    manejadorBorrar.gasto = datosGasto;
    botonBorrar.addEventListener("click", manejadorBorrar);
    bloqueGasto.appendChild(botonBorrar);


    let botonBorrarApi = document.createElement("button");
    botonBorrarApi.textContent = "Borrar (API)";
    botonBorrarApi.classList.add("gasto-borrar-api");
    botonBorrarApi.type = "button";
    let manejadorBorrarApi = new BorrarHandleApi();
    manejadorBorrarApi.gasto = datosGasto;
    botonBorrarApi.addEventListener("click", manejadorBorrarApi);
    bloqueGasto.appendChild(botonBorrarApi);

    let botonEditarFormulario = document.createElement("button");
    botonEditarFormulario.textContent = "Editar (formulario)";
    botonEditarFormulario.classList.add("gasto-editar-formulario");
    botonEditarFormulario.type = "button";
    let manejadorEditarFormulario = new EditarHandleFormulario();
    manejadorEditarFormulario.gasto = datosGasto;
    botonEditarFormulario.addEventListener("click", manejadorEditarFormulario);
    bloqueGasto.appendChild(botonEditarFormulario);
}


function mostrarGastosAgrupadosWeb(idElemento, agrup, periodo) {
  const elemento = document.getElementById(idElemento);
  if (!elemento) return;

  const divAgrupacion = document.createElement("div");
  divAgrupacion.classList.add("agrupacion");

  const titulo = document.createElement("h1");
  titulo.textContent = `Gastos agrupados por ${periodo}`;
  divAgrupacion.appendChild(titulo);

  Object.entries(agrup).forEach(([clave, valor]) => {
    const divDato = document.createElement("div");
    divDato.classList.add("agrupacion-dato");

    const spanClave = document.createElement("span");
    spanClave.classList.add("agrupacion-dato-clave");
    spanClave.textContent = clave;

    const spanValor = document.createElement("span");
    spanValor.classList.add("agrupacion-dato-valor");
    spanValor.textContent = valor;

    divDato.appendChild(spanClave);
    divDato.appendChild(spanValor);
    divAgrupacion.appendChild(divDato);
  });

  elemento.appendChild(divAgrupacion);
}


function repintar() {
    let presupuesto = gp.mostrarPresupuesto();
    mostrarDatoEnId("presupuesto", presupuesto);

    let gastoTotal = gp.calcularTotalGastos();
    mostrarDatoEnId("gastos-totales", gastoTotal);

    let balanceTotal = gp.calcularBalance();
    mostrarDatoEnId("balance-total", balanceTotal);

    const contenedor = document.getElementById("listado-gastos-completo");
    contenedor.innerHTML = "";

    let gastosCompletos = gp.listarGastos();
    for (let gasto of gastosCompletos) {
        mostrarGastoWeb("listado-gastos-completo", gasto);
    }
}

let btnAcualizar = document.getElementById("actualizarpresupuesto");
btnAcualizar.addEventListener("click", actualizarPresupuestoWeb);

function actualizarPresupuestoWeb(){
  let valor = +prompt("Introduce un nuevo presupuesto");
  gp.actualizarPresupuesto(valor);
  repintar();
}

let btnAnyadir = document.getElementById("anyadirgasto");
btnAnyadir.addEventListener("click", nuevoGastoWeb);

function nuevoGastoWeb() {
  let descripcion = prompt("Introduce la descripcion al gasto");
  let valor = +prompt("Introduce un valor al gasto");
  let fecha = prompt("Introduce la fecha del gasto");
  let etiquetas = prompt("Introduce las etiquetas");

  etiquetas = etiquetas.split(",");

  let gasto = new gp.CrearGasto(descripcion, valor, fecha, etiquetas);
  gp.anyadirGasto(gasto);
  repintar();
}


function EditarHandle(){}
EditarHandle.prototype.handleEvent = function(evento){
  let descripcion = prompt("Introduce la descripcion al gasto", this.gasto.descripcion);
  let valor = +prompt("Introduce un valor al gasto", this.gasto.valor);
  let fecha = prompt("Introduce la fecha del gasto", this.gasto.fecha);
  let etiquetas = prompt("Introduce las etiquetas", this.gasto.etiquetas);

  etiquetas = etiquetas.split(",");

  this.gasto.actualizarDescripcion(descripcion);
  this.gasto.actualizarValor(valor);
  this.gasto.actualizarFecha(fecha);
  this.gasto.anyadirEtiquetas(etiquetas);

  repintar();
}

function BorrarHandle(){}
BorrarHandle.prototype.handleEvent = function(){
  gp.borrarGasto(this.gasto.id);
  repintar();
}

function BorrarEtiquetasHandle(){}
BorrarEtiquetasHandle.prototype.handleEvent = function(){
  this.gasto.borrarEtiquetas(this.etiqueta);
  repintar();
}

function CancelarHandle(){}
CancelarHandle.prototype.handleEvent = function(){
  this.formulario.remove();
  this.boton.disabled = false;
}



function EnviarNuevoGastoHandle(){}
EnviarNuevoGastoHandle.prototype.handleEvent = function(event){
  event.preventDefault();

  let formulario = event.currentTarget;
  let descripcion = formulario.elements.descripcion.value;
  let valor = parseFloat(formulario.elements.valor.value);
  let fecha = formulario.elements.fecha.value;
  let etiquetas = formulario.elements.etiquetas.value.split(",").map(e => e.trim());

  let gasto = new gp.CrearGasto(descripcion, valor, fecha, etiquetas);
  gp.anyadirGasto(gasto);

  repintar();
  formulario.remove();
  document.getElementById("anyadirgasto-formulario").disabled = false;
}


function EnviarEditarGastoHandle(){}
EnviarEditarGastoHandle.prototype.handleEvent = function(event){
  event.preventDefault();

  let formulario = event.currentTarget;
  let descripcion = formulario.elements.descripcion.value;
  let valor = parseFloat(formulario.elements.valor.value);
  let fecha = formulario.elements.fecha.value;
  let etiquetas = formulario.elements.etiquetas.value.split(",").map(e => e.trim());

  this.gasto.actualizarDescripcion(descripcion);
  this.gasto.actualizarValor(valor);
  this.gasto.actualizarFecha(fecha);
  this.gasto.anyadirEtiquetas(etiquetas);

  repintar();
  formulario.remove();
}



function EditarHandleFormulario(){}
EditarHandleFormulario.prototype.handleEvent = function(evento){
  const gasto = this.gasto;
  let plantillaFormulario = document.getElementById("formulario-template").content.cloneNode(true);
  let formulario = plantillaFormulario.querySelector("form");

  formulario.elements.descripcion.value = gasto.descripcion;
  formulario.elements.valor.value = gasto.valor;
  formulario.elements.fecha.value = gasto.fecha;
  formulario.elements.etiquetas.value = gasto.etiquetas.join(", ");


  let manejadorSubmit = new EnviarEditarGastoHandle();
  manejadorSubmit.gasto = gasto;
  formulario.addEventListener("submit", manejadorSubmit);


  let botonCancelar = formulario.querySelector("button.cancelar");
  let manejadorCancelar = new CancelarHandle();
  manejadorCancelar.formulario = formulario;
  manejadorCancelar.boton = evento.currentTarget;
  botonCancelar.addEventListener("click", manejadorCancelar);

  let btnEnviarApi = formulario.querySelector(".gasto-enviar-api");
  if (btnEnviarApi) {
    btnEnviarApi.addEventListener("click", async function() {
      const usuario = obtenerUsuarioApi();
      if (!usuario) { alert("Introduce un nombre de usuario"); return; }

      if (!esGastoApi(gasto)) {
        alert("Este gasto es local. Solo los gastos cargados desde la API se pueden editar en ella.");
        return;
      }

      const descripcion = formulario.elements.descripcion.value.trim();
      const valor = Number(formulario.elements.valor.value);
      const fecha = formulario.elements.fecha.value;
      const etiquetas = formulario.elements.etiquetas.value.split(",").map(e => e.trim()).filter(e => e !== "");

      if (!descripcion || isNaN(valor) || !fecha) {
        alert("Rellena descripción, valor y fecha");
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/${usuario}/${gasto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descripcion, valor, fecha, etiquetas })
        });

        if (!resp.ok) { alert("Error al actualizar el gasto en la API"); return; }

        formulario.remove();
        evento.currentTarget.disabled = false;
        await cargarGastosApi();
      } catch (err) {
        console.error(err);
        alert("Error de red al conectar con la API");
      }
    });
  }

  evento.currentTarget.disabled = true;
  evento.currentTarget.parentNode.appendChild(plantillaFormulario);
}

function nuevoGastoWebFormulario(evento){
  let plantillaFormulario = document.getElementById("formulario-template").content.cloneNode(true);
  let formulario = plantillaFormulario.querySelector("form");

  
  let manejadorSubmit = new EnviarNuevoGastoHandle();
  formulario.addEventListener("submit", manejadorSubmit);


  let botonCancelar = formulario.querySelector("button.cancelar");
  let manejadorCancelar = new CancelarHandle();
  manejadorCancelar.formulario = formulario;
  manejadorCancelar.boton = evento.currentTarget;
  botonCancelar.addEventListener("click", manejadorCancelar);

  let btnEnviarApi = formulario.querySelector(".gasto-enviar-api");
  if (btnEnviarApi) {
    btnEnviarApi.addEventListener("click", async function() {
      const usuario = obtenerUsuarioApi();
      if (!usuario) { alert("Introduce un nombre de usuario"); return; }

      const descripcion = formulario.elements.descripcion.value.trim();
      const valor = Number(formulario.elements.valor.value);
      const fecha = formulario.elements.fecha.value;
      const etiquetas = formulario.elements.etiquetas.value.split(",").map(e => e.trim()).filter(e => e !== "");

      if (!descripcion || isNaN(valor) || !fecha) {
        alert("Rellena descripción, valor y fecha");
        return;
      }

      try {
        const resp = await fetch(`${API_BASE}/${usuario}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descripcion, valor, fecha, etiquetas })
        });

        if (!resp.ok) { alert("Error al crear el gasto en la API"); return; }

        formulario.remove();
        evento.currentTarget.disabled = false;
        await cargarGastosApi();
      } catch (err) {
        console.error(err);
        alert("Error de red al conectar con la API");
      }
    });
  }

  evento.currentTarget.disabled = true;
  document.getElementById("controlesprincipales").appendChild(plantillaFormulario);
}

let btnAnyadirFormulario = document.getElementById("anyadirgasto-formulario");
btnAnyadirFormulario.addEventListener("click", nuevoGastoWebFormulario);


function filtrarGastosWeb(event) {
  event.preventDefault();

  let formulario = event.currentTarget;

  let descripcion = formulario.elements["formulario-filtrado-descripcion"].value;
  let valorMinimo = formulario.elements["formulario-filtrado-valor-minimo"].value;
  let valorMaximo = formulario.elements["formulario-filtrado-valor-maximo"].value;
  let fechaDesde = formulario.elements["formulario-filtrado-fecha-desde"].value;
  let fechaHasta = formulario.elements["formulario-filtrado-fecha-hasta"].value;
  let etiquetasTexto = formulario.elements["formulario-filtrado-etiquetas-tiene"].value;

  valorMinimo = valorMinimo !== "" ? parseFloat(valorMinimo) : undefined;
  valorMaximo = valorMaximo !== "" ? parseFloat(valorMaximo) : undefined;

  let etiquetas = undefined;
  if (etiquetasTexto && etiquetasTexto.trim() !== "") {
    etiquetas = gp.transformarListadoEtiquetas(etiquetasTexto);
  }

  let contenedor = document.getElementById("listado-gastos-completo");
  contenedor.innerHTML = "";

  if (!descripcion && valorMinimo === undefined && valorMaximo === undefined &&
      !fechaDesde && !fechaHasta && !etiquetas) {
    gp.listarGastos().forEach(gasto => mostrarGastoWeb("listado-gastos-completo", gasto));
    return;
  }

  let filtro = {
    descripcionContiene: descripcion !== "" ? descripcion : undefined,
    valorMinimo,
    valorMaximo,
    fechaDesde: fechaDesde !== "" ? fechaDesde : undefined,
    fechaHasta: fechaHasta !== "" ? fechaHasta : undefined,
    etiquetasTiene: etiquetas
  };

  gp.filtrarGastos(filtro).forEach(gasto => mostrarGastoWeb("listado-gastos-completo", gasto));
}

let formularioFiltrado = document.getElementById("formulario-filtrado");
if (formularioFiltrado) {
  formularioFiltrado.addEventListener("submit", filtrarGastosWeb);
}



function guardarGastosWeb(){
  localStorage.setItem('GestorGastosDWEC', JSON.stringify(gp.listarGastos()));
}
document.getElementById("guardar-gastos").addEventListener("click", guardarGastosWeb);

function cargarGastosWeb(){
  let gastosRecuperados = localStorage.getItem('GestorGastosDWEC');
  let gastos = gastosRecuperados ? JSON.parse(gastosRecuperados) : [];
  gp.cargarGastos(gastos);
  repintar();
}

async function cargarGastosApi() {
  const usuario = obtenerUsuarioApi();
  if (!usuario) { alert("Introduce un nombre de usuario"); return; }

  const url = `${API_BASE}/${usuario}`;

  try {
    let response = await fetch(url);
    if (!response.ok) throw new Error("Error API");

    let datos = await response.json();

    const adaptados = (Array.isArray(datos) ? datos : []).map(g => {
      const id = g.id ?? g._id ?? g.uuid ?? g.gastoId;
      const descripcion = g.descripcion ?? "";
      const valor = typeof g.valor === "number" ? g.valor : Number(g.valor);

      let fechaMs;
      if (typeof g.fecha === "number") {
        fechaMs = g.fecha;
      } else {
        const parsed = Date.parse(g.fecha);
        fechaMs = isNaN(parsed) ? Date.now() : parsed;
      }

      let etiquetas = [];
      if (Array.isArray(g.etiquetas)) {
        etiquetas = g.etiquetas;
      } else if (typeof g.etiquetas === "string") {
        etiquetas = g.etiquetas.split(",").map(e => e.trim()).filter(e => e !== "");
      }

      return { id, descripcion, valor: isNaN(valor) ? 0 : valor, fecha: fechaMs, etiquetas };
    });

    gp.cargarGastos(adaptados);
    repintar();
  } catch (e) {
    console.error(e);
    alert("Error de red al conectar con la API");
  }
}

let botonCargarGastosApi = document.getElementById("cargar-gastos-api");
if (botonCargarGastosApi) {
  botonCargarGastosApi.addEventListener("click", cargarGastosApi);
}

function BorrarHandleApi(){}
BorrarHandleApi.prototype.handleEvent = async function () {
  const usuario = obtenerUsuarioApi();
  if (!usuario) { alert("Introduce un nombre de usuario"); return; }

  if (!esGastoApi(this.gasto)) {
    alert("Este gasto es local. Solo los gastos cargados desde la API se pueden borrar en ella.");
    return;
  }

  const url = `${API_BASE}/${usuario}/${this.gasto.id}`;

  try {
    const resp = await fetch(url, { method: "DELETE" });
    if (!resp.ok) { alert("Error al borrar el gasto en la API"); return; }
    await cargarGastosApi();
  } catch (err) {
    console.error(err);
    alert("Error de red al conectar con la API");
  }
};


export {
    mostrarDatoEnId,
    mostrarGastoWeb,
    mostrarGastosAgrupadosWeb,
    repintar,
    actualizarPresupuestoWeb,
    nuevoGastoWeb,
    nuevoGastoWebFormulario,
    EditarHandleFormulario,
    filtrarGastosWeb,
    guardarGastosWeb,
    cargarGastosWeb,
    cargarGastosApi,
    BorrarHandleApi
}