# Guía de Instalación y Ejecución — Zuleyka's Closet POS

Este documento te guiará paso a paso para configurar tu entorno de desarrollo, instalar los programas necesarios y ejecutar el proyecto desde cero utilizando Visual Studio Code.

---

## 📦 1. Requisitos Previos e Instalaciones

Antes de abrir el código, asegúrate de tener instalados los siguientes programas en tu computadora (todas las instalaciones son comunes y gratuitas):

1. **Visual Studio Code (VS Code)**
   *   El editor de código principal. Si no lo tienes, descárgalo aquí: [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. **Node.js (LTS)**
   *   Es el entorno de ejecución para que funcione tanto el Frontend como el Backend.
   *   Descarga la versión recomendada (LTS) desde: [https://nodejs.org/es](https://nodejs.org/es)
   *   *Nota: Instálalo con todas las opciones por defecto.*
3. **PostgreSQL**
   *   El motor de bases de datos relacional.
   *   Descárgalo desde: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
   *   **¡Muy Importante!**: Durante la instalación, te pedirá que escribas una contraseña para el usuario por defecto `postgres`. ¡Anota o recuerda bien esta contraseña!
4. **pgAdmin 4 (Incluido con PostgreSQL)**
   *   Es la interfaz gráfica o panel de control visual para administrar tu base de datos fácilmente. (Normalmente se instala automático al instalar PostgreSQL en Windows).

---

## ⚙️ 2. Configurar la Base de Datos (PostgreSQL)

Antes de levantar el código, el sistema de base de datos necesita tener sus tablas creadas.

1. Abre **pgAdmin 4** en tu computadora. Te pedirá la contraseña que pusiste al instalar.
2. En el panel izquierdo, despliega `Servers` > `PostgreSQL 15/16`.
3. Haz clic derecho sobre **Databases** > **Create** > **Database...**
4. En el campo de nombre "Database", escribe: `zuleykas_closet` y haz clic en **Save**.
5. Haz clic derecho sobre tu nueva base de datos `zuleykas_closet` en el panel izquierdo y selecciona la opción **Query Tool...** (Herramienta de Consultas).
6. Ve a la carpeta de tu proyecto en el Explorador de Archivos de Windows: `ISO2/backend/database/`.
7. Abre el archivo `schema.sql`, copia todo su contenido de texto. Pégalo en el Query Tool de pgAdmin y presiona el botón "Play" (Run/▶️). *Esto creará todas las tablas.*
8. Haz lo mismo con el archivo `seed.sql`: Copia el contenido, borra lo anterior en Query Tool, pega esto nuevo y presiona "Play". *Esto insertará la cuenta de "admin" y las configuraciones base.*

---

## 🚀 3. Ejecutar el Proyecto en Visual Studio Code

### Paso 3.1. Preparar el Entorno (VS Code)
1. Abre **Visual Studio Code**.
2. Ve al menú superior: `Archivo (File) > Abrir Carpeta... (Open Folder...)` y selecciona la carpeta raíz de tu proyecto (la carpeta **`ISO2`** de tu escritorio).
3. Abre la terminal integrada de VS Code presionando `Ctrl + ñ` (o en el menú `Ver > Terminal`). 
   *Nota: Necesitaremos tener **dos pestañas de terminal** corriendo al mismo tiempo: Una para el Servidor Backend y otra para el Frontend Visual.*

### Paso 3.2. Configurar e Iniciar el Backend (Terminal 1)
1. En tu terminal abierta, escribe el siguiente comando para entrar a la carpeta del servidor:
   ```bash
   cd backend
   ```
2. Renombra o duplica el archivo `.env.example` y llámalo simplemente **`.env`** (está dentro de la carpeta `/backend`).
3. Abre el archivo `.env` en VS Code y fíjate en esta línea:
   `DB_URL=postgresql://postgres:postgres@localhost:5432/zuleykas_closet`
   Modifícala si pusiste una contraseña diferente al instalar PostgreSQL, donde dice `:postgres@`  debe ser `:TuContrasena@`.
4. Instala los paquetes necesarios del backend ejecutando el comando:
   ```bash
   npm install
   ```
   *(Espera a que finalice la carga).*
5. Finalmente, levanta el servidor backend con:
   ```bash
   npm run dev
   ```
   *(Debe decirte en consola que el servidor está corriendo en el puerto 5000 y se conectó a PostgreSQL).* **¡No cierres esta terminal!**

### Paso 3.3. Configurar e Iniciar el Frontend (Terminal 2)
1. En la ventana de la terminal de VS Code, busca un icono de "+" (Más) en la barra superior lateral de las terminales para **abrir una nueva pestaña de terminal**.
2. En esta terminal vacía, entra a la carpeta del cliente (visual):
   ```bash
   cd frontend
   ```
3. Instala los paquetes (librerías de React, Recharts, iconos, etc.):
   ```bash
   npm install
   ```
   *(Espera a que finalice la barra de progreso. Puede tomar uno o dos minutos).*
4. Inicia el servidor de la aplicación visual:
   ```bash
   npm run dev
   ```
   *(Te saldrá un mensaje verde diciendo que se lanzó Vite y está corriendo local).*

---

## 🎉 4. Ingresar al Sistema
1. Abre tu navegador favorito (Chrome, Edge, Firefox).
2. Ve a la siguiente dirección en la barra de búsqueda:
   **[http://localhost:3000](http://localhost:3000)**
3. Verás la pantalla de Login de **Zuleyka's Closet**. Ingresa con las credenciales que cargamos:
   *   **Usuario:** `admin`
   *   **Contraseña:** `password`

*¡Listo! Ya tienes ambas piezas del software y la base de datos corriendo localmente.*

---

## 💡 Recomendaciones para VS Code (Extensiones Útiles/Opcionales)
Si quieres leer el código más cómodamente, en la sección de Extensiones (`Ctrl + Shift + X`) de VS Code te recomiendo instalar:
1. **ES7+ React/Redux/React-Native snippets**: Autocompletado de código para React.
2. **PostgreSQL** o **SQLTools**: Permiten ver tus tablas de BD directo en VS Code sin abrir pgAdmin.
3. **Prettier - Code formatter**: Da formato y ordena los colores del código para leerlo mejor.
