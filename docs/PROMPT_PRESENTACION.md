# Prompt para generar presentacion de ConviviApp 2.0

> Copia y pega este prompt en la herramienta de IA para presentaciones que prefieras
> (Gamma, Beautiful.ai, Canva AI, Google Slides AI, etc.)

---

## PROMPT

Crea una presentacion profesional para un Trabajo de Fin de Master (TFM) sobre una plataforma web llamada **ConviviApp 2.0**. La presentacion debe tener un tono profesional pero cercano, con un diseño moderno y limpio. Usa una paleta de colores oscura (fondo dark navy #0f0f23) con acentos en indigo/purple (#6366f1), texto blanco y detalles en verde, rojo y ambar cuando corresponda.

---

### SLIDE 1 - PORTADA

**ConviviApp 2.0**
Gestion integral de pisos compartidos

- Trabajo de Fin de Master - Master en Desarrollo de Apps con IA
- Big School - Director: Brais Moure
- Autor: Jose Luis Manzanares Fernandez
- Febrero 2026

---

### SLIDE 2 - EL PROBLEMA

**Compartir piso no deberia ser tan dificil**

Datos reales sobre la convivencia compartida:

- El 67-73% de los conflictos en pisos compartidos son por dinero
- El 45% de las personas siente que hace mas tareas que el resto
- Los compañeros usan 4+ apps (WhatsApp, notas, Excel, Bizum) sin integracion
- El 23% de las compras se desperdician por falta de coordinacion
- El 78% de las salidas de piso generan disputas economicas

El unico competidor integral (Flatastic) lleva abandonado desde 2021. El mercado tiene un hueco enorme y nadie lo esta cubriendo.

---

### SLIDE 3 - LA SOLUCION

**ConviviApp 2.0: Todo en un solo lugar**

Plataforma web fullstack que digitaliza y optimiza todos los aspectos de la convivencia en pisos compartidos, eliminando las fricciones economicas, organizativas y comunicativas.

Propuesta de valor unica: "La unica plataforma que unifica gestion economica, tareas domesticas y comunicacion en un ecosistema disenado especificamente para la convivencia compartida"

Publico objetivo: Jovenes de 18-35 anos, estudiantes universitarios y profesionales en pisos compartidos (2-8 personas). Mercado en Espana: ~1.4 millones de personas.

---

### SLIDE 4 - LANDING PAGE

**Primera impresion**

La pagina de inicio presenta ConviviApp con un diseño oscuro y moderno:
- Titular: "Gestion integral de pisos compartidos"
- Subtitulo: "Gastos, tareas, compras y mas. Todo en un solo lugar para que la convivencia sea facil y sin conflictos"
- Dos CTAs: "Comenzar gratis" (boton purple) y "Ya tengo cuenta" (boton outlined)
- Tres tarjetas de features principales con iconos circulares purple: Gastos compartidos, Tareas rotativas, Lista de compras
- Footer: "ConviviApp - TFM Master en Desarrollo con IA"

---

### SLIDE 5 - REGISTRO Y HOGARES

**Empieza en segundos**

Flujo de entrada:
1. Registro con email, nombre y contrasena
2. Pantalla "Mis hogares" con saludo personalizado ("Hola, Jose Luis")
3. Dos opciones: "Crear hogar" o "Unirme a uno"
4. Crear hogar: formulario con Nombre del hogar, Descripcion y Direccion
5. Codigo de invitacion: codigo alfanumerico corto (ej: Q6RMCKUK) con boton "Copiar" para compartir con companeros

Caracteristicas de seguridad:
- Autenticacion JWT con rotacion automatica de tokens
- Deteccion de robo de sesion (token family revocation)
- Refresh token en cookie httpOnly
- Access token en memoria (no localStorage)

---

### SLIDE 6 - DASHBOARD

**Todo de un vistazo**

El dashboard del hogar muestra dos secciones principales:

**Tu resumen** - 4 tarjetas KPI:
- Mi Balance: saldo actual en euros (positivo/negativo/equilibrado)
- Por confirmar: pagos pendientes de confirmar
- Mis Tareas: numero de tareas asignadas
- Mi Karma: puntos y ranking en el hogar

**Accesos rapidos** - Grid de 9 modulos:
1. Gastos - gastos este mes
2. Tareas - tareas del hogar
3. Compras - items pendientes
4. Tablon - anuncios activos
5. Calendario - fecha actual
6. Reservas - espacios compartidos
7. Reportes - ver estadisticas
8. Reglas - reglas del hogar
9. Miembros - companeros de piso

Indicador "En vivo" en esquina superior derecha (conexion WebSocket activa). Toggle de dark mode. Campana de notificaciones. Engranaje de configuracion.

---

### SLIDE 7 - MODULO DE GASTOS

**Gastos compartidos con simplificacion inteligente de deudas**

Funcionalidades:
- Registro de gastos con descripcion, monto, pagador y participantes
- Division de gastos: partes iguales (MVP), porcentajes, cantidades fijas
- Historial de gastos filtrable con icono de categoria, pagador, fecha y monto
- Panel de Balances lateral: muestra "Pago: X euros / Debe: X euros" por persona
- Boton "Nuevo gasto" siempre accesible

Algoritmo de simplificacion de deudas:
- Calcula el balance neto de cada miembro (total pagado - total que debia)
- Balance positivo = acreedor, Balance negativo = deudor
- Minimiza el numero de transferencias necesarias usando un algoritmo greedy
- Ejemplo: 5 deudas cruzadas entre 4 personas se reducen a solo 2-3 transferencias

---

### SLIDE 8 - REPORTES MENSUALES

**Datos claros para decisiones informadas**

Pantalla de reportes mensuales con navegacion por mes:

4 tarjetas KPI en fila:
- Total gastos: suma del mes en euros
- Media por miembro: gasto medio por persona
- Tareas completadas: X de Y asignadas
- Tasa de cumplimiento: porcentaje con indicador de estado

Graficas interactivas:
- "Quien pago": grafica donut/circular mostrando porcentaje de contribucion de cada miembro
- "Pagado vs Debido": grafica de barras agrupadas comparando lo que cada persona pago vs lo que debia

Estadisticas adicionales:
- "Tareas por miembro": barras horizontales (completadas en verde, pendientes en rojo)
- "Ranking de Karma": barras verticales con puntuacion por miembro
- Boton "Imprimir" para exportar el reporte

---

### SLIDE 9 - MODULO DE TAREAS

**Tareas domesticas con sistema de Karma**

Sistema de gestion de tareas con tres pestanas:
- Mis Tareas: tareas asignadas al usuario actual
- Todas: vista global de todas las tareas del hogar
- Catalogo: plantillas de tareas reutilizables

Cada tarea incluye:
- Nombre y descripcion
- Frecuencia: Unica, Diaria, Semanal, Bisemanal, Mensual
- Dificultad: sistema de estrellas (1-5) con etiqueta (Normal, Dificil, etc.)
- Asignacion a miembro con fecha de vencimiento
- Estado: Pendiente, En progreso, Completada, Omitida
- Acciones: "Iniciar" (boton purple) y "Omitir (-15 pts)" (boton ambar)

Sistema de Karma:
- Ranking con medalla dorada para el lider
- Puntos = dificultad x 10, bonus +5 si se completa a tiempo
- Penalizacion de -15 puntos por omitir tarea
- Barra de progreso visual por miembro
- Gamificacion que incentiva la participacion equitativa

---

### SLIDE 10 - LISTA DE COMPRAS

**Compras compartidas en tiempo real**

Interfaz sencilla y eficiente:
- Campo "Anadir item" con nombre del producto, cantidad numerica y boton "Anadir"
- Seccion "Por comprar" con contador de items pendientes
- Cada item muestra: nombre, cantidad con unidades, checkbox circular para marcar como comprado, boton X para eliminar
- Sincronizacion en tiempo real via WebSocket: lo que un companero anade, otro lo ve al instante sin recargar

Flujo de compra:
1. Un companero anade "Leche - 2 unidades" desde casa
2. Otro companero en el supermercado ve el item instantaneamente
3. Al marcar como comprado, se puede convertir automaticamente en gasto compartido

---

### SLIDE 11 - TABLON DE ANUNCIOS Y VOTACIONES

**Comunicacion organizada y democracia domestica**

Tres tipos de publicaciones:
- Anuncio: informacion general para todos (ej: "Viene el fontanero el martes")
- Encuesta: recoger opiniones con fecha limite
- Votacion: tomar decisiones con opciones y quorum configurable

Funcionalidades:
- Boton "+ Nuevo anuncio" destacado
- Filtros por tipo: Todos, Anuncios, Encuestas
- Cada publicacion muestra: tipo (badge de color), titulo, autor, tiempo relativo, contenido
- Votaciones con opciones ilimitadas (ej: "Cena del viernes: Pizza / Sushi / Hamburguesa")
- Contador de votos en tiempo real
- Quorum opcional y fecha limite opcional
- Iconos de bookmark (fijar) y eliminar

---

### SLIDE 12 - REGLAS DEL HOGAR

**Normas claras, convivencia en paz**

Sistema de reglas con categorias y prioridades:

Categorias disponibles: Convivencia, Limpieza, Ruido, Visitas, Espacios, Gastos, General

Tres niveles de prioridad:
- Normal (boton default)
- Importante (boton warning)
- Critica (boton rojo con borde destacado)

Cada regla muestra:
- Titulo con borde lateral de color segun prioridad (rojo para critica)
- Tags de categoria y prioridad
- Descripcion detallada
- Barra de progreso de aceptacion por miembros (ej: "0/1 miembros - 0%")
- Chips con nombres de miembros que han aceptado
- Informacion del creador y fecha
- Botones "Aceptar" y eliminar

Flujo: Se crea la regla -> Cada miembro la acepta individualmente -> Se ve el progreso de aceptacion

---

### SLIDE 13 - RESERVAS DE ESPACIOS

**Espacios compartidos sin conflictos**

Gestion de espacios comunes del hogar:
- Crear espacios: Salon, Lavadora, Banera, Terraza, etc.
- Cada espacio tiene: icono, nombre, contador de reservas, duracion maxima y duracion por slot
- Ejemplo: "Salon - 0 reservas - Max: 60 min - Slot: 30 min"
- Boton "Nuevo espacio" para anadir mas
- Sistema de reservas por franjas horarias para evitar solapamientos

---

### SLIDE 14 - FUNCIONES TRANSVERSALES

**Detalles que marcan la diferencia**

- Dark mode: toggle con 3 opciones (claro, oscuro, sistema) y persistencia
- Notificaciones: campana con contador en el header
- Indicador "En vivo": punto verde que confirma conexion WebSocket activa
- Calendario compartido: vista integrada en el dashboard con fecha actual
- Codigo de invitacion: sistema sencillo para que nuevos companeros se unan
- Responsive: la interfaz se adapta a diferentes tamanos de pantalla
- PWA: instalable como aplicacion desde el navegador

---

### SLIDE 15 - ARQUITECTURA TECNICA

**Stack tecnologico moderno y profesional**

```
FRONTEND                    BACKEND                     INFRA
React 18 + TypeScript       Node.js 20 + Express        Docker multi-stage
Vite 5 (build tool)         Prisma 5 (ORM)              GitHub Actions CI/CD
Tailwind CSS + shadcn/ui    PostgreSQL 15               pnpm + Turborepo
Zustand (estado global)     Socket.io (real-time)
React Query v5 (cache)      JWT + Passport (auth)
React Router v6             Zod (validacion)
```

Monorepo con 3 paquetes:
- **shared**: 23 interfaces TypeScript + 25 schemas Zod compartidos entre frontend y backend
- **client**: Frontend React con arquitectura feature-based
- **server**: Backend Express con capas separadas (routes -> controllers -> services)

---

### SLIDE 16 - CALIDAD Y TESTING

**Calidad de produccion, no de demo academica**

Metricas de calidad:
- 130+ tests de integracion cubriendo todos los modulos
- TypeScript estricto end-to-end (shared -> server -> client)
- Manejo de errores con jerarquia de errores tipados
- Validacion Zod en TODAS las rutas de la API
- Event Bus tipado para desacoplar Socket.io de la logica de negocio

Seguridad:
- Auth JWT con rotacion de tokens y deteccion de robo (token family revocation)
- Passwords hasheados con bcrypt (cost factor 10)
- Helmet para headers de seguridad
- Rate limiting en endpoints sensibles
- CORS configurado por entorno
- Docker con usuarios non-root y health checks

CI/CD Pipeline:
- Lint (ESLint) en cada push
- Type-check (tsc --noEmit)
- Build verificado con Turborepo

---

### SLIDE 17 - DESARROLLO CON IA

**Claude Code como copiloto de desarrollo**

ConviviApp 2.0 fue desarrollada con la asistencia de Claude Code (Claude Opus 4.6, Anthropic), una herramienta CLI que permite al modelo de IA trabajar directamente sobre el codigo del proyecto.

Metodologia de trabajo:
1. El desarrollador define QUE construir (requisitos, prioridades)
2. La IA propone COMO implementarlo (arquitectura, codigo)
3. El desarrollador REVISA y APRUEBA cada cambio
4. Se sigue un flujo de fases sin saltar etapas

Contribucion de la IA por fase:
- Arquitectura: proponer estructura de monorepo y patrones
- Backend: generar controllers, services, middlewares
- Frontend: generar componentes, hooks, stores
- Infraestructura: configurar Docker, CI/CD, Prisma
- Debugging: diagnosticar y proponer soluciones
- Documentacion: redactar documentacion tecnica

Aprendizaje clave: "Desarrollar con IA no significa delegar. Significa tomar mejores decisiones, mas rapido. Tu mantienes el criterio, la IA amplifica la ejecucion."

---

### SLIDE 18 - MVP vs IMPLEMENTADO

**Muy por encima de los requisitos**

MVP requerido (5 modulos):
1. Auth (registro, login, logout)
2. Hogares (crear, unirse, miembros)
3. Gastos (CRUD, division igual, balances)
4. Tareas (CRUD, asignar, completar)
5. Lista de compras

Implementado (14 modulos - +180% sobre requisitos):
1. Auth con JWT avanzado y rotacion de tokens
2. Hogares con codigo de invitacion
3. Gastos con simplificacion de deudas
4. Tareas con rotacion y sistema de Karma
5. Lista de compras en tiempo real
6. Tablon de anuncios
7. Sistema de votaciones con quorum
8. Reglas del hogar con categorias y prioridades
9. Reservas de espacios compartidos
10. Reportes mensuales con graficas
11. Estadisticas con ranking de Karma
12. Calendario compartido
13. Dark mode con persistencia
14. PWA instalable

+9 features extra que ningun requisito pedia.

---

### SLIDE 19 - DIFERENCIACION

**ConviviApp vs la competencia**

| Funcionalidad | Splitwise | Flatastic | ConviviApp 2.0 |
|---|---|---|---|
| Gastos compartidos | Si | Si | Si - con simplificacion optimizada |
| Simplificacion deudas | Si | No | Si - algoritmo greedy |
| Tareas rotativas | No | Basico | Si - con Karma y gamificacion |
| Lista compras | No | Basico | Si - colaborativa en tiempo real |
| Votaciones | No | No | Si - con quorum configurable |
| Reglas del hogar | No | No | Si - con categorias y prioridades |
| Reservas espacios | No | No | Si - con slots y duracion maxima |
| Reportes mensuales | No | No | Si - con graficas interactivas |
| Tiempo real | No | No | Si - WebSocket con indicador "En vivo" |
| Codigo abierto | No | No | Si |

Ventaja clave: Flatastic (unico competidor integral) esta abandonada desde 2021. Splitwise solo cubre gastos. ConviviApp es la unica solucion integral activa.

---

### SLIDE 20 - PROXIMOS PASOS

**El roadmap de ConviviApp**

Completado:
- 14 modulos funcionales
- 130+ tests de integracion
- Docker + CI/CD
- PWA instalable
- Dark mode

Proximos pasos:
- Notificaciones push
- Modo offline
- Despliegue en produccion (Railway/Render)
- Tests de frontend (componentes)
- Integracion con Bizum para pagos directos
- Multi-idioma

---

### SLIDE 21 - CIERRE

**ConviviApp 2.0**
Gestion integral de pisos compartidos

Trabajo de Fin de Master
Master en Desarrollo de Apps con Inteligencia Artificial
Big School - Director: Brais Moure

Desarrollado con Claude Code (Anthropic)

Stack: React + Vite | Node.js + Express + Prisma | PostgreSQL | Socket.io | Docker

Gracias.
