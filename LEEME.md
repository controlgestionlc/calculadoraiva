# Calculadora IVA F29 — PWA

App instalable (móvil y escritorio) para el cálculo de IVA F29 del Grupo La Cabaña.
Se aloja en GitHub Pages y guarda los datos en Firebase (proyecto `calculadoraiva-83a7f`).

## Contenido del repositorio

```
index.html              La aplicación completa (calculadora, consolidación,
                        comparador SII↔Laudus, parámetros UTM/UTA)
manifest.webmanifest    Metadatos de la PWA (nombre, iconos, colores)
sw.js                   Service worker: permite abrir la app sin conexión
offline.html            Pantalla de respaldo cuando no hay conexión ni caché
icons/                  Iconos de la app (192, 512, maskable, apple-touch)
firestore.rules         Reglas de seguridad — copiar a la consola de Firebase
.nojekyll               Evita que GitHub Pages procese los archivos con Jekyll
```

---

## 1. Publicar en GitHub Pages

1. Sube **todo el contenido de esta carpeta** a la raíz del repositorio `calculadoraiva`
   (los archivos sueltos, no la carpeta que los contiene).
2. En GitHub: **Settings → Pages**.
3. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` → **Save**.
4. A los 1–2 minutos la app queda en:

```
https://TU-USUARIO.github.io/calculadoraiva/
```

> El archivo `.nojekyll` es necesario: sin él GitHub Pages ignora algunos archivos.

---

## 2. Configurar Firebase (una sola vez)

### 2.1 Habilitar el login con Google

**Firebase Console → Authentication → Sign-in method → Google → Habilitar.**
Define el correo de asistencia del proyecto y guarda.

### 2.2 Autorizar el dominio de GitHub Pages

**Authentication → Settings → Authorized domains → Add domain:**

```
TU-USUARIO.github.io
```

Sin este paso el login falla con `auth/unauthorized-domain`.

### 2.3 Crear la base de datos y publicar las reglas

1. **Firestore Database → Crear base de datos** (modo producción, región `southamerica-east1` o `us-central`).
2. Pestaña **Reglas** → pega el contenido de `firestore.rules` → **Publicar**.

---

## 3. Quién puede entrar

El acceso está restringido a una lista de correos. Para agregar a alguien hay que
tocar **dos** lugares (si falta uno, la persona entra pero no ve datos, o al revés):

1. `index.html` → busca `CORREOS_AUTORIZADOS` (cerca del final del archivo) y agrega el correo.
2. `firestore.rules` → agrega el mismo correo a la lista y vuelve a publicar las reglas.

Correos autorizados actualmente:

- `rodrigo.briones.friz@gmail.com`
- `controlgestionlc@gmail.com`

Quien inicie sesión con otra cuenta de Google verá el mensaje *"La cuenta … no tiene acceso"*.

---

## 4. Instalar la app

- **Android / Chrome de escritorio:** aparece el botón *Instalar* en la barra de direcciones.
- **iPhone / iPad (Safari):** Compartir → *Agregar a pantalla de inicio*.

Ya instalada, abre a pantalla completa y funciona sin conexión: los cálculos quedan
guardados en el dispositivo y se sincronizan con Firebase al recuperar señal.

---

## 5. Datos que se guardan en Firestore

| Colección       | Documento          | Contenido                                            |
|-----------------|--------------------|------------------------------------------------------|
| `calculosIVA`   | id del cálculo     | Cálculo mensual por empresa, con el detalle completo |
| `parametrosSII` | período `YYYY-MM`  | UTM y UTA del mes, con su fuente y fecha             |

---

## 6. Publicar una versión nueva

1. Reemplaza `index.html` en el repositorio.
2. Sube el número de `VERSION` en `sw.js` (ej. `v1.0.0` → `v1.0.1`).

Sin el cambio de versión el service worker sigue sirviendo la copia antigua desde la
caché. Al abrir la app aparece el aviso *"Hay una versión nueva disponible"*.

---

## 7. Si algo falla

| Síntoma                                   | Causa habitual                                                        |
|-------------------------------------------|------------------------------------------------------------------------|
| `auth/unauthorized-domain`                | Falta agregar `TU-USUARIO.github.io` en *Authorized domains*           |
| `auth/operation-not-allowed`              | El proveedor Google no está habilitado                                 |
| Entra pero no aparecen los cálculos       | Las reglas no incluyen ese correo, o no se publicaron                  |
| "Actualizar desde el SII" no trae valores | El SII bloquea la lectura directa; la app reintenta por proxy y por    |
|                                           | mindicador.cl. Si los tres fallan, carga los valores manualmente.      |
| La app no se actualiza                    | Falta subir la `VERSION` de `sw.js`                                    |
