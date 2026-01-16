/* =======================================================
   SISTEMA DE ÓRDENES DE ALMUERZO
   Implementación canónica del contrato
   ======================================================= */

/* =======================================================
   🧱 BLOQUE C — PEDIDO CANÓNICO
   Representación pura de intención humana
   ======================================================= */

const crearPedidoVacio = () => ({
    bases: [],  // [{ id: "A", cantidad: 2 }, ...]
    extras: []  // ["JUGO", "POSTRE"]
});

const Pedido = {
    // Agregar o actualizar base
    setBase(pedido, id, cantidad) {
        const bases = pedido.bases.filter(b => b.id !== id);
        if (cantidad > 0) {
            bases.push({ id, cantidad });
        }
        return { ...pedido, bases };
    },
    
    // Obtener cantidad de una base específica
    getCantidadBase(pedido, id) {
        const base = pedido.bases.find(b => b.id === id);
        return base ? base.cantidad : 0;
    },
    
    // Toggle extra (sin cambios)
    toggleExtra(pedido, extraId) {
        const extras = pedido.extras.includes(extraId)
            ? pedido.extras.filter(e => e !== extraId)
            : [...pedido.extras, extraId];
        return { ...pedido, extras };
    },
    
    // Reset
    reset() {
        return crearPedidoVacio();
    },
    
    // Verificar si está vacío
    estaVacio(pedido) {
        return pedido.bases.length === 0;
    }
};

/* =======================================================
   🧱 BLOQUE D — TIEMPO (AXIOMA)
   Única fuente de verdad temporal
   ======================================================= */

const Tiempo = {
    // D es función pura, sin estado
    obtenerEstado() {
        const ahora = new Date();
        const hora = ahora.getHours();
        const minutos = ahora.getMinutes();
        const minutosTotales = hora * 60 + minutos;
        const diaSemana = ahora.getDay(); // 0 = Domingo
        
        // Franjas horarias con puntos BASE (métricas crudas)
        const FRANJAS = [
            { id: 'TEMPRANO', desde: 420, hasta: 659, puntosBase: 3 },  // 7:00-10:59
            { id: 'NORMAL', desde: 660, hasta: 719, puntosBase: 1 },     // 11:00-11:59
            { id: 'TARDIO', desde: 720, hasta: 840, puntosBase: 0 }      // 12:00-14:00
        ];
        
        // Detectar franja
        let franja = null;
        let puntosBase = 0;
        
        for (const f of FRANJAS) {
            if (minutosTotales >= f.desde && minutosTotales <= f.hasta) {
                franja = f.id;
                puntosBase = f.puntosBase;
                break;
            }
        }
        
        // Calcular próximo despacho posible
        const DESPACHOS = [720, 750, 780, 810, 840]; // 12:00, 12:30, 13:00, 13:30, 14:00
        let despachoMinutos = null;
        
        for (const d of DESPACHOS) {
            if (minutosTotales < d) {
                despachoMinutos = d;
                break;
            }
        }
        
        // Verificar fin de semana
        const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
        
        // Retornar objeto inmutable
        return Object.freeze({
            hora,
            minutos,
            minutosTotales,
            diaSemana,
            franja,
            puntosBase,
            despachoMinutos,
            esFinDeSemana,
            timestamp: ahora.getTime(),
            fechaLegible: ahora.toLocaleDateString('es-EC'),
            horaLegible: ahora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
        });
    }
};

/* =======================================================
   🧱 BLOQUE E — REGLAS OPERATIVAS
   Interpreta tiempo y contexto, NO persuade
   ======================================================= */

const Reglas = {
    // E es función pura: recibe D y C, devuelve evaluación
    evaluar(pedido, estadoTiempo) {
        // E confía ciegamente en D (axioma)
        const { franja, puntosBase, despachoMinutos, esFinDeSemana } = estadoTiempo;
        
        // Modelo NO booleano: ejecutabilidad + motivo + contexto
        let ejecutabilidad = 'NO_EJECUTABLE';
        let motivo = null;
        let despachoAsignado = null;
        let estadoMercado = 'CERRADO';
        
        // Evaluación por jerarquía
        if (esFinDeSemana) {
            ejecutabilidad = 'NO_EJECUTABLE';
            motivo = 'FIN_DE_SEMANA';
            estadoMercado = 'CERRADO';
        } else if (!franja) {
            ejecutabilidad = 'NO_EJECUTABLE';
            motivo = 'FUERA_DE_HORARIO';
            estadoMercado = 'CERRADO';
        } else if (!despachoMinutos) {
            ejecutabilidad = 'NO_EJECUTABLE';
            motivo = 'SIN_DESPACHO';
            estadoMercado = 'CERRADO';
        } else {
            // Ejecutable
            ejecutabilidad = 'AHORA';
            estadoMercado = `ABIERTO_${franja}`;
            
            // Calcular hora de despacho
            const h = Math.floor(despachoMinutos / 60);
            const m = despachoMinutos % 60;
            despachoAsignado = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
        
        // E NO gamifica, solo informa puntos base
        // Los puntos NO influyen en ejecutabilidad
        return Object.freeze({
            ejecutabilidad,
            motivo,
            despachoAsignado,
            estadoMercado,
            puntos: puntosBase  // Informativo, NO persuasivo
        });
    }
};

/* =======================================================
   🧱 BLOQUE F — TRADUCTOR
   Convierte estructura a lenguaje humano
   ======================================================= */

const Traductor = {
    // F traduce estado, NUNCA lee DOM
    generarMensaje(pedido, evaluacion, estadoTiempo, menu) {
        if (pedido.bases.length === 0) {
            return null;
        }
        
        let mensaje = `*🍽️ PEDIDO DE ALMUERZO*\n\n`;
        mensaje += `📅 Fecha: ${estadoTiempo.fechaLegible}\n`;
        mensaje += `⏰ Hora: ${estadoTiempo.horaLegible}\n`;
        mensaje += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        mensaje += `*📦 PEDIDO:*\n`;
        
        // Iterar sobre bases (incluir detalleHoy si existe)
        pedido.bases.forEach(base => {
            const opcion = menu.opciones[base.id];
            const detalle = opcion.detalleHoy ? ` — ${opcion.detalleHoy}` : '';
            mensaje += `• ${base.cantidad} × ${opcion.emoji} ${opcion.nombre}${detalle}\n`;
        });
        
        if (pedido.extras.length > 0) {
            mensaje += `\n*➕ EXTRAS:*\n`;
            pedido.extras.forEach(extraId => {
                const extra = menu.extras[extraId];
                mensaje += `• ${extra.emoji} ${extra.nombre}\n`;
            });
        }
        
        // Información de despacho (si disponible)
        if (evaluacion.despachoAsignado) {
            mensaje += `\n🚚 *Despacho estimado:* ${evaluacion.despachoAsignado}\n`;
        } else {
            mensaje += `\n⚠️ *Nota:* Pedido fuera de horario regular\n`;
        }
        
        // Puntos (informativos, NO persuasivos)
        if (evaluacion.puntos > 0) {
            mensaje += `⭐ *Puntos:* ${evaluacion.puntos}\n`;
        }
        
        mensaje += `\n_Enviado desde la app de pedidos_`;
        
        return mensaje.trim();
    }
};

/* =======================================================
   🧱 BLOQUE G — ORQUESTADOR
   Único bloque con estado, coordina todo
   ======================================================= */

const Sistema = {
    // Estado del sistema (ÚNICO stateful)
    estado: 'INIT',  // INIT | LISTO | ENVIANDO | ENVIADO | ERROR
    pedido: null,
    menu: null,
    tiempo: null,
    evaluacion: null,
    whatsappNumber: null,
    
    // Callbacks para B (inyección de dependencias)
    callbacks: {},
    
    /* =========================
       INICIALIZACIÓN
    ========================= */
    
    async iniciar() {
        console.log('🚀 Sistema iniciando...');
        this.estado = 'INIT';
        
        try {
            // 1. Cargar catálogo (JSON)
            this.menu = await this.cargarMenu();
            
            // 2. Cargar configuración local
            this.whatsappNumber = localStorage.getItem('whatsapp_number') || '593XXXXXXXXX';
            
            // 3. Crear pedido vacío
            this.pedido = crearPedidoVacio();
            
            // 4. Inyectar callbacks en B
            this.callbacks = {
                onAjustarBase: (id, delta) => this.ajustarBase(id, delta),
                onExtra: (id) => this.toggleExtra(id),
                onEnviar: () => this.enviarPedido(),
                onReset: () => this.resetearPedido()
            };
            
            // 5. Inicializar UI (B)
            if (typeof inicializarUI === 'function') {
                inicializarUI(this.callbacks, this.menu);
            }
            
            // 6. Primera evaluación
            this.actualizarSistema();
            
            // 7. Tick periódico (cada 1 minuto)
            setInterval(() => this.actualizarSistema(), 60000);
            
            this.estado = 'LISTO';
            console.log('✅ Sistema listo');
            
        } catch (error) {
            console.error('❌ Error al iniciar sistema:', error);
            this.estado = 'ERROR';
            alert('Error al cargar el sistema. Por favor recarga la página.');
        }
    },
    
    async cargarMenu() {
        // Menú cargado desde menu.js (datos separados de lógica)
        // MENU_DATA definido en menu.js - editable por operador
        if (typeof MENU_DATA === 'undefined') {
            throw new Error('MENU_DATA no encontrado. Verificar que menu.js está cargado.');
        }
        return MENU_DATA;
    },
    
    /* =========================
       COORDINACIÓN (G orquesta)
    ========================= */
    
    ajustarBase(id, delta) {
        const cantidadActual = Pedido.getCantidadBase(this.pedido, id);
        const nuevaCantidad = Math.max(0, cantidadActual + delta);
        this.pedido = Pedido.setBase(this.pedido, id, nuevaCantidad);
        this.actualizarSistema();
    },
    
    toggleExtra(id) {
        this.pedido = Pedido.toggleExtra(this.pedido, id);
        this.actualizarSistema();
    },
    
    resetearPedido() {
        // Sin agencia humana, G no resetea automáticamente
        this.pedido = Pedido.reset();
        this.actualizarSistema();
    },
    
    /* =========================
       CICLO DE ACTUALIZACIÓN
    ========================= */
    
    actualizarSistema() {
        // 1. Consultar D (axioma de tiempo)
        this.tiempo = Tiempo.obtenerEstado();
        
        // 2. Evaluar con E (recibe D como input)
        this.evaluacion = Reglas.evaluar(this.pedido, this.tiempo);
        
        // 3. Notificar a B (G no manipula DOM directamente)
        this.notificarUI();
    },
    
    notificarUI() {
        // G traduce estado del sistema → datos para B
        if (typeof actualizarUI === 'function') {
            actualizarUI({
                pedido: this.pedido,
                evaluacion: this.evaluacion,
                tiempo: this.tiempo,
                menu: this.menu
            });
        }
    },
    
    /* =========================
       ENVÍO (G coordina, F traduce)
    ========================= */
    
    enviarPedido() {
        // Evaluación final (determinista)
        this.tiempo = Tiempo.obtenerEstado();
        this.evaluacion = Reglas.evaluar(this.pedido, this.tiempo);
        
        // Verificar que hay pedido
        if (Pedido.estaVacio(this.pedido)) {
            alert('Por favor selecciona tu pedido.');
            return;
        }
        
        // Informar si no es ejecutable ahora (no bloquear)
        if (this.evaluacion.ejecutabilidad === 'NO_EJECUTABLE') {
            const motivos = {
                'FUERA_DE_HORARIO': 'Estamos fuera de horario. Tu pedido se puede registrar de todas formas.',
                'SIN_DESPACHO': 'Ya no hay despachos disponibles hoy.',
                'FIN_DE_SEMANA': 'No atendemos sábados ni domingos.'
            };
            const mensaje = motivos[this.evaluacion.motivo] || 'Pedido fuera de horario.';
            
            if (!confirm(`⚠️ ${mensaje}\n\n¿Deseas enviar el pedido de todas formas?`)) {
                return;
            }
        }
        
        this.estado = 'ENVIANDO';
        
        // F traduce (recibe datos estructurados, NO lee DOM)
        const mensaje = Traductor.generarMensaje(
            this.pedido,
            this.evaluacion,
            this.tiempo,
            this.menu
        );
        
        if (!mensaje) {
            this.estado = 'ERROR';
            alert('Error al generar el mensaje.');
            return;
        }
        
        // Abrir WhatsApp

const base = 'https://wa.me';

let phone;
try {
    phone = normalizarNumeroWhatsAppEC(this.whatsappNumber);
} catch (e) {
    alert('Número de WhatsApp inválido. Verifica la configuración.');
    this.estado = 'ERROR';
    return;
}

// 🔍 DIAGNÓSTICO (aquí van los logs)
console.log('RAW:', this.whatsappNumber);
console.log('NORMALIZADO:', phone);
console.log('LENGTH:', phone.length);

// 🔒 Validación dura (kill switch)
if (!/^5939\d{8}$/.test(phone)) {
    alert(`Número inválido detectado: ${phone}`);
    return;
}

// Mensaje
const mensaje = generarMensaje(); // o como lo tengas

// Endpoint FINAL
const url = `${base}/${phone}?text=${encodeURIComponent(mensaje)}`;
window.open(url, '_blank');

       
        // G.estado = ENVIADO significa "sistema ejecutó envío"
        // NO significa "pedido confirmado" (eso es externo)
        this.estado = 'ENVIADO';
        
        // Confirmación visual no invasiva
        this.mostrarConfirmacion();
        
        console.log('✅ Pedido enviado');
    },
    
    /* =========================
       CONFIGURACIÓN
    ========================= */
    
    guardarConfiguracion(numero) {
        this.whatsappNumber = numero;
        localStorage.setItem('whatsapp_number', numero);
        console.log('💾 Configuración guardada');
    },
    
    /* =========================
       CONFIRMACIÓN VISUAL
    ========================= */
    
    mostrarConfirmacion() {
        if (typeof mostrarMensajeConfirmacion === 'function') {
            mostrarMensajeConfirmacion();
        }
    }
};

/* =======================================================
   EXPORTACIÓN (si se usa como módulo)
   ======================================================= */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Sistema, Pedido, Tiempo, Reglas, Traductor };
}

