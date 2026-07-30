# RastroPet — Backend y Frontend

Perez Cruz Haniel Eliud



Sistema full-stack para el reporte y seguimiento de mascotas perdidas en la comunidad. Este documento describe la parte de **backend** (API REST en Laravel), sus roles de usuario, endpoints, notificaciones y cómo levantarlo localmente y en producción.

> El frontend (React) se documenta y versiona por separado en su propia carpeta/repositorio por el otro integrante del equipo.

---

## Tabla de contenido

- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Diagrama Entidad-Relación](#diagrama-entidad-relación)
- [Roles de usuario y permisos](#roles-de-usuario-y-permisos)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Comunicación con el usuario (Email / SMS / WhatsApp)](#comunicación-con-el-usuario-email--sms--whatsapp)
- [Pruebas con Bruno](#pruebas-con-bruno)
- [Despliegue en VPS](#despliegue-en-vps)
- [Capturas de pantalla](#capturas-de-pantalla)
- [Diseño en Figma](#diseño-en-figma)
- [Tablero de GitHub Projects](#tablero-de-github-projects)
- [Equipo](#equipo)

---

## Tecnologías utilizadas

### Backend

- **PHP 8.3**
- **Laravel 13** — framework principal de la API REST.
- **Laravel Sanctum 4** — autenticación basada en tokens para la API (login, registro, logout).
- **Laravel Socialite 5** — disponible para autenticación con proveedores externos.
- **MySQL 8** — motor de base de datos relacional.
- **Twilio SDK (PHP) 8.11** — envío de SMS y mensajes de WhatsApp.
- **Laravel Mail (SMTP)** — envío de correos, apuntando en producción al servidor Postfix propio del VPS.
- **Faker PHP** — generación de datos de prueba en los seeders.
- **Laravel Pint** — formateo de código PHP.
- **PHPUnit / Mockery** — pruebas del backend.

### Frontend

- **React 19**
- **Vite 8** — bundler y servidor de desarrollo.
- **React Router DOM 7** — enrutamiento y rutas protegidas.
- **Axios** — consumo de la API REST.
- **Leaflet + React-Leaflet** — mapa interactivo para ubicar reportes y avistamientos.
- **ESLint** — linting del código.

### Infraestructura y herramientas

- **Git + GitHub** — control de versiones, historial de commits y GitHub Projects.
- **Bruno** — pruebas y documentación de los endpoints de la API.
- **Figma** — diseño y prototipado navegable de las pantallas.
- **Nginx** — proxy reverso en el VPS.
- **Let's Encrypt (Certbot)** — certificado SSL para HTTPS.
- **Postfix** — servidor de correo propio en el VPS, con SPF y DKIM configurados.

---

## Diagrama Entidad-Relación

<img width="1121" height="838" alt="image" src="https://github.com/user-attachments/assets/e3ac3b9b-2bb0-44fa-8c1d-ff5a8f3ff09d" />


```


```

**Resumen de entidades principales:**

- **roles** — catálogo de roles (`admin`, `dueño`, `voluntario`).
- **users** — usuarios del sistema, cada uno pertenece a un `role`.
- **zonas** — zonas geográficas de referencia usadas para ubicar reportes en el mapa.
- **reportes** — reporte de una mascota perdida/encontrada, hecho por un `dueño` (`users`), asociado a una `zona`.
- **avistamientos** — tabla pivote **N:M** entre `users` (voluntarios) y `reportes`: un voluntario puede avistar varios reportes y un reporte puede tener varios avistamientos de distintos voluntarios. Guarda además comentario, coordenadas y fecha del avistamiento.
- **notificaciones** — historial de cada correo/SMS/WhatsApp enviado por el sistema, con su estado (`enviado` / `fallido`).

**Relación muchos a muchos:** `reportes` ⇄ `users` a través de `avistamientos` (con columnas extra en el pivote: `comentario`, `lat`, `lng`, `fecha`).

---

## Roles de usuario y permisos

El sistema maneja **3 niveles de acceso**, definidos por el campo `role_id` en la tabla `users` (relacionado con la tabla `roles`). El control se aplica en dos capas:

1. **Backend:** middleware `role:` sobre las rutas en `routes/api.php`, más una `Policy` (`ReportePolicy`) para validar si un usuario es dueño real del recurso o admin.
2. **Frontend:** el componente de React oculta o muestra botones/acciones según `user.role.name`, y `ProtectedRoute` bloquea el acceso a rutas privadas si no hay sesión.

### Administrador (`admin`)
- Acceso total al sistema.
- Gestión de usuarios (listar, editar, eliminar) vía `/api/users`.
- Puede crear/editar/eliminar **zonas**.
- Puede crear, editar y eliminar **cualquier** reporte (no solo los propios).
- Único rol con acceso al historial de notificaciones (`/api/notificaciones`).

### Dueño (`dueño`)
- Puede crear reportes de mascotas perdidas/encontradas.
- Puede ver y buscar todos los reportes públicos.
- Solo puede editar o eliminar **sus propios** reportes (validado con `ReportePolicy`).
- Recibe notificaciones automáticas (correo, SMS, WhatsApp) sobre sus reportes.

### Voluntario (`voluntario`)
- Puede ver y buscar todos los reportes.
- Puede registrar **avistamientos** sobre un reporte existente (ubicación, comentario, fecha).
- No puede crear, editar ni eliminar reportes.
- Al registrar un avistamiento, se notifica automáticamente al dueño del reporte.

---

## Credenciales de prueba

> Cargadas automáticamente por los seeders (`php artisan db:seed`). No modificar estos datos durante la evaluación para no afectar las cuentas de los demás.

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador (developer) | `admin@rastropet.com` | `Admin123!` |
| Dueño | `ana.martinez@rastropet.com` | `Dueno123!` |
| Voluntario | `luis.torres@rastropet.com` | `Voluntario123!` |

---

## Instalación local

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd rastropet-fullstack/backend

# 2. Instalar dependencias
composer install

# 3. Configurar variables de entorno
cp .env.example .env
php artisan key:generate

# 4. Crear la base de datos MySQL "rastropet" y configurar
#    DB_DATABASE, DB_USERNAME y DB_PASSWORD en .env

# 5. Ejecutar migraciones y seeders
php artisan migrate --seed

# 6. Levantar el servidor de desarrollo
php artisan serve
```

La API quedará disponible en `http://127.0.0.1:8000/api`.

También se incluye un respaldo SQL completo en `database/rastropet_backup.sql`, por si se prefiere importarlo directamente en phpMyAdmin/MySQL Workbench en lugar de correr los seeders.

---

## Variables de entorno

Las variables sensibles nunca se suben al repositorio (`.env` está en `.gitignore`). El archivo `.env.example` documenta las variables necesarias sin valores reales:

```
DB_DATABASE=rastropet
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=587
MAIL_FROM_ADDRESS="noreply@rastropet.com"

TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_FROM=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

> En producción, `MAIL_MAILER` se configura como `smtp` apuntando al Postfix propio del VPS (ver sección de [Despliegue](#despliegue-en-vps)).

---

## Endpoints de la API

**URL base:** `[ AQUÍ VA LA URL BASE DE LA API EN EL VPS, ej. https://api.rastropet.com/api ]`

### Autenticación (públicas)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/register` | Registro de nuevo usuario (dueño o voluntario) |
| POST | `/auth/login` | Inicio de sesión, retorna token Sanctum |
| POST | `/auth/forgot-password` | Solicita recuperación de contraseña |
| POST | `/auth/reset-password` | Restablece la contraseña con el token recibido |

### Autenticación (protegidas — requieren token)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/logout` | Cierra la sesión actual |
| GET | `/auth/me` | Datos del usuario autenticado |

### Zonas
| Método | Endpoint | Rol requerido |
|---|---|---|
| GET | `/zonas` | Cualquier usuario autenticado |
| POST | `/zonas` | `admin` |
| PUT | `/zonas/{zona}` | `admin` |
| DELETE | `/zonas/{zona}` | `admin` |

### Reportes
| Método | Endpoint | Rol requerido |
|---|---|---|
| GET | `/reportes` | Cualquier usuario autenticado (con paginación y filtros: `search`, `especie`, `estado`, `zona_id`, `per_page`) |
| GET | `/reportes/{reporte}` | Cualquier usuario autenticado |
| POST | `/reportes` | `dueño`, `admin` |
| PUT | `/reportes/{reporte}` | Dueño del reporte o `admin` (validado por Policy) |
| DELETE | `/reportes/{reporte}` | Dueño del reporte o `admin` (validado por Policy) |

### Avistamientos
| Método | Endpoint | Rol requerido |
|---|---|---|
| GET | `/reportes/{reporte}/avistamientos` | Cualquier usuario autenticado |
| POST | `/reportes/{reporte}/avistamientos` | `voluntario`, `admin` |

### Usuarios y notificaciones (solo admin)
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/users` | Lista paginada de usuarios |
| GET / PUT / DELETE | `/users/{user}` | Ver, editar o eliminar un usuario |
| GET | `/notificaciones` | Historial de correos/SMS/WhatsApp enviados |

Todas las respuestas de error siguen el formato JSON estándar con el código HTTP correspondiente (`422` validación, `401` no autenticado, `403` sin permiso, `404` no encontrado, `500` error de servidor).

---

## Comunicación con el usuario (Email / SMS / WhatsApp)

Cada reporte y avistamiento dispara notificaciones automáticas reales a través de `App\Services\NotificacionService`:

- **Correo electrónico**, enviado por el servidor SMTP/Postfix propio (no servicios de terceros como SendGrid).
- **SMS**, vía Twilio, al número de contacto capturado en el reporte.
- **WhatsApp**, vía Twilio WhatsApp API, al mismo número de contacto.

Casos que disparan notificaciones:
1. **Reporte creado** → correo + SMS + WhatsApp de confirmación al dueño.
2. **Avistamiento registrado por un voluntario** → correo + SMS + WhatsApp avisando al dueño.
3. **Reporte marcado como "Encontrado"** → correo al dueño.

Cada intento (exitoso o fallido) queda registrado en la tabla `notificaciones`, visible para el administrador en `/api/notificaciones`.

---
## Frontend

El frontend de RastroPet fue desarrollado como una Single Page Application (SPA) utilizando React y Vite, proporcionando una interfaz rápida, moderna y responsiva para la interacción de los usuarios con el sistema.

La aplicación consume la API REST desarrollada en Laravel mediante peticiones HTTP con Axios, permitiendo una comunicación eficiente entre cliente y servidor.

### Características principales

- Inicio de sesión y registro de usuarios.
- Autenticación mediante tokens utilizando Laravel Sanctum.
- Protección de rutas según el rol del usuario.
- Dashboard personalizado para cada tipo de usuario.
- Gestión completa de reportes de mascotas.
- Visualización de reportes mediante tarjetas y tablas.
- Mapa interactivo con Leaflet para consultar reportes y registrar avistamientos.
- Formularios con validaciones antes del envío al servidor.
- Búsqueda y filtrado de reportes por especie, estado y zona.
- Diseño adaptable (Responsive Design) para computadoras, tablets y dispositivos móviles.

---

### Arquitectura

El proyecto sigue una estructura modular para facilitar su mantenimiento.

```
src/
│
├── components/
│   ├── Navbar
│   ├── Sidebar
│   ├── ProtectedRoute
│   ├── Cards
│   └── Formularios
│
├── pages/
│   ├── Login
│   ├── Register
│   ├── Dashboard
│   ├── Reportes
│   ├── Avistamientos
│   ├── Perfil
│   └── Administrador
│
├── services/
│   └── api.js
│
├── hooks/
│
├── context/
│
├── assets/
│
└── router/
```

Cada módulo tiene una responsabilidad específica, permitiendo reutilizar componentes y mantener una separación clara entre lógica de negocio y presentación.

---

### Flujo de navegación

1. El usuario accede a la pantalla de inicio de sesión.
2. React envía las credenciales a la API mediante Axios.
3. Laravel valida al usuario y devuelve un token.
4. El token se almacena para mantener la sesión activa.
5. Dependiendo del rol recibido, el usuario es redirigido a su dashboard correspondiente.
6. Todas las operaciones posteriores consumen la API utilizando el token de autenticación.

---

### Dashboards por rol

#### Administrador

Tiene acceso completo al sistema.

Puede:

- Administrar usuarios.
- Administrar zonas.
- Administrar todos los reportes.
- Consultar el historial de notificaciones.
- Supervisar la actividad del sistema.

#### Dueño

Puede:

- Registrar mascotas perdidas.
- Editar únicamente sus propios reportes.
- Eliminar sus reportes.
- Consultar el estado de las búsquedas.
- Recibir notificaciones cuando exista un avistamiento.

#### Voluntario

Puede:

- Consultar reportes.
- Buscar mascotas cercanas.
- Registrar avistamientos.
- Visualizar la ubicación en el mapa.
- Ayudar a localizar mascotas perdidas.

---

### Interfaz de usuario

La interfaz fue diseñada buscando una experiencia sencilla e intuitiva.

Se utilizaron los siguientes principios de diseño:

- Navegación clara.
- Menús laterales para acceder rápidamente a cada módulo.
- Tarjetas para visualizar reportes.
- Colores consistentes en todo el sistema.
- Formularios simples con validaciones.
- Íconos para mejorar la experiencia del usuario.
- Diseño responsive para diferentes tamaños de pantalla.

---

### Comunicación con la API

Toda la comunicación se realiza mediante Axios.

Las peticiones incluyen automáticamente el token del usuario autenticado para acceder a los endpoints protegidos.

El frontend interpreta las respuestas del servidor para:

- Mostrar mensajes de éxito.
- Mostrar errores de validación.
- Redireccionar cuando la sesión expira.
- Actualizar la información en tiempo real después de cada operación.

---

### Seguridad implementada

Desde el frontend se implementaron medidas para mejorar la seguridad y la experiencia del usuario:

- Protección de rutas privadas.
- Redirección automática cuando no existe sesión.
- Ocultamiento de opciones según el rol.
- Validación de formularios antes de enviarlos.
- Manejo de errores provenientes de la API.
- Cierre de sesión eliminando el token almacenado.

## Pruebas con Bruno

La colección está versionada en `backend/bruno/` e incluye, entre otros:

- `01-login.bru` — login y obtención del token.
- `02-me-protegida.bru` — uso del token en una ruta protegida.
- `03-login-error.bru` — caso de error: credenciales inválidas.
- `04-reportes-sin-token.bru` — caso de error: acceso sin token (401).
- `18-listar-usuarios-sin-permiso.bru` — caso de error: acceso denegado por rol (403).

Para probar: abrir Bruno → **Open Collection** → seleccionar la carpeta `backend/bruno` → elegir el entorno `Local`.

---

## Despliegue en VPS

- **Servidor:** `[ IP o dominio del VPS ]`
- **URL del proyecto (HTTPS):** `[ AQUÍ VA EL LINK CON HTTPS ]`
- **URL base de la API:** `[ AQUÍ VA LA URL BASE DE LA API ]`
- **Proxy reverso:** Nginx
- **Certificado SSL:** Let's Encrypt (Certbot), renovación automática
- **Correo saliente:** Postfix configurado directamente en el VPS, con registros SPF y DKIM



## Capturas de pantalla



**Login**


<img width="1920" height="887" alt="image" src="https://github.com/user-attachments/assets/74bf76dd-eea6-47ec-b34b-70d912e0f220" />




**Dashboard**


<img width="1600" height="858" alt="image" src="https://github.com/user-attachments/assets/9a7d2d0b-2b09-4564-b158-3f7efcff678e" />




**Notificación recibida (correo)**


<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/bcd967a8-292c-43a6-a7b8-c42ef3bf8ac9" />



---

## Diseño en Figma

**Prototipo navegable:** ``

Link de figma: https://www.figma.com/proto/HNcLUicQgIHEAWEYhYz0uB/proyecto1?node-id=106-18
---

## Tablero GitHub Projects

Frontend:
https://github.com/Mammal117/rastropet-frontend.git
Backend:
https://github.com/Mammal117/rastropet-backend.git

---

## Equipo

- **Ortiz Bautista Josue Ahuitz]** — Backend (Laravel, base de datos, comunicación)
- **Perez Cruz Haniel Eliud** — Frontend (React)
