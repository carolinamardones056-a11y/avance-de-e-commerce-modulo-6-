let catalogomangas = [];

async function cargarCatalogo() {
  try {
    const res = await fetch('/productos');
    if (!res.ok) throw new Error('Error al cargar productos');
    catalogomangas = await res.json();
    if (document.getElementById("todoslosmangas")) {
      renderizarcatalogo();
    }
  } catch (error) {
    console.error(error);
  }
}

async function procesarCompra() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }
  try {
    const descuento = inputDesc ? inputDesc.value.trim().toUpperCase() : '';
    const payload = { carrito, descuento };
    
    const res = await fetch('/venta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const resp = await res.json();
      throw new Error(resp.error || 'Error al procesar la venta');
    }

    const data = await res.json();
    alert(`¡Compra exitosa! ID Venta: ${data.idVenta} | Total: ${CLP.format(data.total)}`);
    carrito = [];
    guardarcarrito();
    renderizarcarrito();
    await cargarCatalogo();
  } catch (error) {
    alert(error.message);
  }
}

let carrito = [];
let factordescuento = 1;

const KEY_CARRITO = "carrito";

function guardarcarrito() {
  localStorage.setItem(KEY_CARRITO, JSON.stringify(carrito));
}

function cargarcarrito() {
  const data = localStorage.getItem(KEY_CARRITO);
  carrito = data ? JSON.parse(data) : [];
}

function agregarcarrito (idmanga) {
    const prod = catalogomangas.find (p => p.id === idmanga);
    if (prod){
      carrito.push({...prod});
      guardarcarrito();
      alert(`¡${prod.nombre} agregado al carrito!`);
      if (document.getElementById("cuerpocarrito")) {
        renderizarcarrito();
      }
    }
};
function quitarcarrito (idmanga){
    const idx = carrito.findIndex (p => p.id ===idmanga);
    if (idx >= 0) carrito.splice(idx, 1);
    guardarcarrito();
    renderizarcarrito();
};
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});
function aplicaciondescuento (codigodescuento) {
    if (codigodescuento === "DESC15" ) {
        carrito.forEach (p => p.descuentoaplicado = true);
        factordescuento = 0.85;
        return true

    } else {
      factordescuento = 1;
      carrito.forEach (p => p.descuentoaplicado = false);
      return false;

    }
};
function calcularmonto (){
  const subtotal = carrito.reduce ((acc, p) => acc + p.precio, 0);
  const total = Math.round(subtotal*factordescuento);
  return {subtotal, total};

};

function actualizarmonto() {
  const elSubtotal = document.getElementById("subtotal");
  const elTotal = document.getElementById("total");
  const elBadge = document.getElementById("badgeDescuento");
  
  if (!elSubtotal || !elTotal) return;
  
  const { subtotal, total } = calcularmonto();
  elSubtotal.textContent = CLP.format(subtotal);
  elTotal.textContent = CLP.format(total);
  if (elBadge) {
    if (factordescuento === 0.85) {
      elBadge.textContent = "DESC15 aplicado";
    } else {
      elBadge.textContent = "Sin descuento";
    }
  }
};
const btnDesc = document.getElementById("btnAplicarDescuento");
const inputDesc = document.getElementById("inputDescuento");

function renderizarcarrito () {
  const lineaprod = document.getElementById("cuerpocarrito");
  if (!lineaprod) return;
  lineaprod.innerHTML = "";
  if (carrito.length === 0) {
    lineaprod.innerHTML = `<tr><td colspan="3" class="text-center text-secondary">Carrito vacío</td></tr>`;
    actualizarmonto();
    return;
  }
  carrito.forEach((ma) => {
    const tr = document.createElement("tr");
    tr.innerHTML = 
    `<td> ${ma.nombre} (ID: ${ma.id}) </td>
    <td> ${CLP.format(ma.precio)} </td>
    <td> 
    <button class="btn btn-dark w-100">Quitar producto</button>
    </td>`;
    tr.querySelector("button").addEventListener("click", () => {
      quitarcarrito (ma.id);
    });
    lineaprod.appendChild(tr);
  });
  actualizarmonto();
}
function renderizarcatalogo(){
    const grid = document.getElementById("todoslosmangas");
    if (!grid) return;
    grid.innerHTML = "";
    catalogomangas.forEach((p) => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6";
        col.innerHTML = `<div class="card h-100">
        <div class="card-body">
          <img src="${p.img}" class="card-img-top" alt="${p.nombre}" style="height:280px; object-fit:cover;">
          <h5 class="card-title mb-1">${p.nombre}</h5>
          <p class="card-text mb-3">${CLP.format(p.precio)} - Stock: ${p.stock}</p>
          <button class="btn btn-dark w-100" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}</button>
           <a href="${p.url}" class="btn btn-link">
                Ver detalles
              </a>
        </div>
      </div>`;
      col.querySelector("button").addEventListener("click", () => {
        agregarcarrito(p.id);
      })
      grid.appendChild(col);
    });
};
document.addEventListener("DOMContentLoaded", () => {
  const btnDesc = document.getElementById("btnAplicarDescuento");
  const inputDesc = document.getElementById("inputDescuento");

  if (btnDesc && inputDesc) {
    btnDesc.addEventListener("click", () => {
      const codigo = inputDesc.value.trim().toUpperCase();
      aplicaciondescuento(codigo);
      guardarcarrito();    
      renderizarcarrito(); 
  });
  }

  const btnComprar = document.getElementById("btnComprarAhora");
  if (btnComprar) {
    btnComprar.addEventListener("click", procesarCompra);
  }
});

const PASSWORD_MAESTRA = "1234";
let usuarioLogueado = false;

let modalAuth = null;
let tipoModal = "login"; 

function mostrarModal(tipo) {
  tipoModal = tipo;

  const title = document.getElementById("modalAuthTitle");
  const err = document.getElementById("authError");
  const u = document.getElementById("authUsuario");
  const p = document.getElementById("authPassword");
  const btn = document.getElementById("btnAuthSubmit");

  if (err) { err.style.display = "none"; err.textContent = ""; }
  if (u) u.value = "";
  if (p) p.value = "";
  if (title) title.textContent = (tipo === "registro") ? "Registro" : "Inicio de sesión";
  if (btn) btn.textContent = (tipo === "registro") ? "Registrar" : "Ingresar";

  modalAuth.show();
}
function iniciarSesion(usuario, password) {
  if (password === PASSWORD_MAESTRA) {
    usuarioLogueado = true;

    console.log("Usuario logueado:", usuario);

    const estado = document.getElementById("estadoUsuario");
    if (estado) {
      estado.textContent = `Sesión: ${usuario}`;
      estado.classList.remove("text-white-50");
      estado.classList.add("text-success");
    }

    modalAuth.hide();
    return true;
  }

  console.warn("Credenciales inválidas");
  return false;
};
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("modalAuth");
  if (modalEl) modalAuth = new bootstrap.Modal(modalEl);

  const btnRegistro = document.getElementById("btnRegistro");
  const btnLogin = document.getElementById("btnLogin");
  const btnSubmit = document.getElementById("btnAuthSubmit");

  if (btnRegistro) btnRegistro.addEventListener("click", () => mostrarModal("registro"));
  if (btnLogin) btnLogin.addEventListener("click", () => mostrarModal("login"));

  if (btnSubmit) {
    btnSubmit.addEventListener("click", () => {
      const usuario = document.getElementById("authUsuario").value.trim();
      const password = document.getElementById("authPassword").value;
      const err = document.getElementById("authError");

      if (!usuario || !password) {
        if (err) { err.style.display = "block"; err.textContent = "Completa usuario y password."; }
        return;
      }

      const ok = iniciarSesion(usuario, password);
      if (!ok && err) {
        err.style.display = "block";
        err.textContent = "Password incorrecta.";
      }
    });
  }
});


cargarcarrito();
cargarCatalogo();
renderizarcarrito();

