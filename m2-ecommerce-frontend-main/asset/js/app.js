let catalogomangas = [
    {id: 1, nombre: "Kimi no Yoru ni Fureru", valor: 10990, img: "./asset/img/kimi.jpg", url:"../detalledeproducto.html"  ,descuentoaplicado: false },
    {id: 2, nombre: "On Doorstep", valor: 10490, img: "./asset/img/on.jpg", url:"../detalledeproducto2.html", descuentoaplicado: false },
    {id: 3, nombre: "Apron Yankee", valor: 9990, img: "./asset/img/apron.jpg",url:"../detalledeproducto3.html", descuentoaplicado: false },
    {id: 4, nombre: "Subarashii Kiseki ni Yasashii Kimi to", valor: 10990, img: "./asset/img/subarashii.jpg",url:"../detalledeproducto4.html", descuentoaplicado: false },
    {id: 5, nombre: "Jinx", valor: 11990, img: "./asset/img/jinx.jpg", descuentoaplicado: false },
    {id: 6, nombre: "2020", valor: 10990, img: "./asset/img/2020.jpg", descuentoaplicado: false },
];
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
      
    } if (document.getElementById("cuerpocarrito")) {
    renderizarcarrito();
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
  const subtotal = carrito.reduce ((acc, p) => acc + p.valor, 0);
  const total = Math.round(subtotal*factordescuento);
  return {subtotal, total};
};

function actualizarmonto() {
  const elSubtotal = document.getElementById("subtotal");
  const elTotal = document.getElementById("total");
  const elBadge = document.getElementById("badgeDescuento");
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
  lineaprod.innerHTML = "";
  if (carrito.length === 0) {
    lineaprod.innerHTML = `<tr><td colspan="3" class="text-center text-secondary">Carrito vacío</td></tr>`;
    actualizarmonto();
    return;
  }
  carrito.forEach((ma) => {
    const tr = document.createElement("tr");
    tr.innerHTML = 
    `<td> ${ma.nombre} </td>
    <td> ${CLP.format(ma.valor)} </td>
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
    grid.innerHTML = "";
    catalogomangas.forEach((p) => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6";
        col.innerHTML = `<div class="card h-100">
        <div class="card-body">
          <img src="${p.img}" class="card-img-top" alt="${p.nombre}" style="height:280px; object-fit:cover;">
          <h5 class="card-title mb-1">${p.nombre}</h5>
          <p class="card-text mb-3">${CLP.format(p.valor)}</p>
          <button class="btn btn-dark w-100">Agregar al carrito </button>
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
  cargarcarrito();

 
  if (document.getElementById("todoslosmangas")) {
    renderizarcatalogo();
  }
  if (document.getElementById("cuerpocarrito")) {
    renderizarcarrito();
  }

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
renderizarcatalogo();
renderizarcarrito();

