# Publicación de Veilix

> Procedimiento interno para el propietario: publicar las descargas de Veilix en GitHub Releases sin exponer el código propietario. La primera publicación es la estable `0.1.3`, elegida por el propietario el 30 de octubre de 2026, solo para Chrome y Edge. Los paquetes de `0.1.2` se conservan como históricos y no se publican. No forma parte del repositorio público de distribución. La sección de descargas para usuarios está en el [README](../README.md#-descargar-veilix).

## Por qué no se usa el repositorio de Veilix

El repositorio de Veilix es **privado**. Los archivos de una Release de un repositorio privado solo pueden descargarlos quienes tienen acceso a él, así que no sirven como descarga pública. Hacerlo público expondría el código fuente.

## Repositorio público de distribución

Opción propuesta, pendiente de la autorización del propietario: un repositorio público aparte, dedicado solo a la distribución.

| Primera publicación (`v0.1.3`) | Nunca se publica |
| --- | --- |
| `veilix-0.1.3-chrome.zip` y `veilix-0.1.3-edge.zip` | `veilix-0.1.3-sources.zip`: es el código fuente, y solo se entrega a Mozilla para su revisión |
| `SHA256SUMS.txt`, con las huellas de **solo** esos dos paquetes | `veilix-0.1.3-firefox.zip` y `veilix-0.1.3-safari.zip`: son paquetes técnicos, no instalables por usuarios finales |
| Un README breve para usuarios, con las secciones públicas del README principal (sin el apartado «Documentación», que enlaza a documentos internos), y las notas de la versión | El código fuente (`src/`, `scripts/`, `tests/`, configuración), los diagnósticos, `CHANGELOG.md`, `AGENTS.md` y la documentación interna |
| Los términos de uso de la licencia propietaria | Credenciales, `.env` y datos personales |

**Publicaciones posteriores:** el `.xpi` de Firefox, cuando Mozilla lo firme, y la app de Safari, cuando exista y esté firmada.

Los paquetes contienen el código compilado de la extensión, como cualquier extensión de navegador. Ya se revisó que no incluyen diagnósticos, pruebas, mapas de código ni credenciales.

### Aislamiento

- **Repositorio nuevo.** Créalo vacío, desde cero: sin bifurcar el repositorio de Veilix, sin importarlo ni reflejarlo y sin enviarle ramas o etiquetas de este clon. Las etiquetas del repositorio privado (`v0.1.2`, `v0.1.3`…) tampoco se envían: la Release del repositorio de distribución tiene su propia etiqueta `v0.1.3`, creada allí. Su historial no puede contener ningún commit del repositorio privado.
- **Clon propio.** Trabaja en una carpeta nueva, **fuera** del clon privado, con su propio `git init` o `git clone` del repositorio de distribución. Nunca añadas el repositorio privado como remoto.
- **Contenido versionado:** solo documentación pública. Es decir, el README para usuarios, las notas de la versión y los términos de la licencia.
- **README público:** una copia de las secciones públicas del `README.md` principal, sin el apartado «Documentación», que enlaza a documentos internos. Si muestra el logotipo, copia también `public/icon/128.png`, que es la imagen pública de la extensión, o retira la imagen.
- **Paquetes:** se suben únicamente como archivos adjuntos de la Release, no como commits.
- **Archivos automáticos de GitHub:** cada Release incluye siempre «Source code (zip)» y «Source code (tar.gz)», con el contenido del repositorio de distribución en la etiqueta. Por eso ese repositorio solo puede contener lo autorizado.
- **Lo que no puede estar en ningún commit ni en la Release:** el código fuente propietario, `veilix-0.1.3-sources.zip`, los diagnósticos, `CHANGELOG.md`, `AGENTS.md`, la documentación interna, `.env`, credenciales ni datos personales.

## Prueba de humo del paquete final

Antes de publicar, confirma que el paquete exacto que se va a distribuir conserva el comportamiento aprobado de `0.1.3-beta.0`:

1. Descomprime `.output/veilix-0.1.3-chrome.zip` en una carpeta nueva. No uses `.output/chrome-mv3`, que puede contener otra compilación.
2. En Chrome, en `chrome://extensions`, desactiva o quita cualquier otra copia de Veilix. Pulsa «Cargar descomprimida» y elige esa carpeta.
3. Comprueba que el panel de Veilix muestra **«Veilix 0.1.3»**, sin «beta», con el candado y el crédito.
4. Abre WhatsApp Web con los cinco interruptores activos y comprueba que se difuminan:
   - los nombres y las fotos de la lista y de la conversación;
   - las vistas previas, los mensajes y el campo de escritura;
   - «Info. del contacto» y «Nuevo chat».
5. **Llamadas:** en una llamada de voz, el nombre, el estado y la duración del panel deben verse difuminados, y el avatar también. Silenciar, la cámara y colgar deben funcionar. En la conversación, las tarjetas de llamada deben tener el título y el estado difuminados, con el icono nítido.
6. **Revelado:** pasa el cursor por encima y usa Ctrl + Mayús + Espacio. Después desactiva cada interruptor por separado, sin recargar: solo se revela lo suyo.
7. **Si quieres, repite** los pasos 1 a 3 con `veilix-0.1.3-edge.zip` en `edge://extensions`.

## Pasos, cuando lo autorices

1. **Crea el repositorio público de distribución** según las reglas de aislamiento. Por ejemplo, con un nombre como `veilix-releases`; el nombre lo decides tú. Antes de etiquetar, comprueba en su clon que solo contiene lo autorizado y que el historial es solo suyo:

   ```bash
   git ls-files                  # Solo la documentación pública autorizada.
   git log --oneline             # Solo commits del repositorio de distribución.
   git remote -v                 # Solo el repositorio de distribución.
   ```
2. **Prepara los paquetes desde la raíz del proyecto Veilix.** El guion se ejecuta en un `bash` aparte, así que cualquier fallo lo detiene sin cerrar tu terminal. Antes de generar `SHA256SUMS.txt` comprueba:
   - que la lista de paquetes es exactamente la autorizada;
   - que cada paquete existe, se puede leer y es la versión `0.1.3`;
   - que su huella SHA-256 es exactamente la del informe de estabilización de `0.1.3`;
   - que no contiene archivos internos.

   Si algo falla, no deja ningún `SHA256SUMS.txt`.

   ```bash
   bash <<'GUION'
   set -euo pipefail
   cd .output
   detener() { echo "DETENER: $*" >&2; exit 1; }
   # Huella SHA-256 con sha256sum o, en macOS, shasum -a 256.
   if command -v sha256sum >/dev/null; then huellas() { sha256sum "$@"; }
   elif command -v shasum >/dev/null; then huellas() { shasum -a 256 "$@"; }
   else detener "no se encontró sha256sum ni shasum"; fi
   # Si algo falla, no queda ningún SHA256SUMS.txt a medias.
   trap 'estado=$?; if [ "$estado" -ne 0 ]; then rm -f SHA256SUMS.txt; fi' EXIT
   rm -f SHA256SUMS.txt

   # Huella SHA-256 de los paquetes de Chrome y Edge de 0.1.3 (idénticos), del informe de estabilización.
   HUELLA_ESPERADA=97cabb6c68582812a110d169eab8ae54bd347e5b1fc65adea5883f278ba6165a

   # Lista explícita de paquetes autorizados (sin comodines: veilix-0.1.3-*.zip incluiría el de fuentes).
   AUTORIZADOS=(veilix-0.1.3-chrome.zip veilix-0.1.3-edge.zip)
   if [ "${AUTORIZADOS[*]}" != "veilix-0.1.3-chrome.zip veilix-0.1.3-edge.zip" ]; then
     detener "la lista de paquetes no es la autorizada: ${AUTORIZADOS[*]}"
   fi

   for paquete in "${AUTORIZADOS[@]}"; do
     if [ ! -f "$paquete" ] || [ ! -s "$paquete" ]; then detener "falta $paquete o está vacío"; fi
     if ! listado=$(unzip -Z1 "$paquete"); then detener "no se pudo leer el listado de $paquete"; fi
     if ! grep -qx 'manifest.json' <<<"$listado"; then detener "$paquete no tiene manifest.json en la raíz"; fi
     if ! manifiesto=$(unzip -p "$paquete" manifest.json); then detener "no se pudo leer el manifiesto de $paquete"; fi
     if ! grep -q '"version": *"0\.1\.3"' <<<"$manifiesto"; then detener "$paquete no es la versión 0.1.3"; fi
     if grep -Eq '(^|/)(src|scripts|tests|node_modules)/|diagnostico|sources|\.map$|(^|/)\.env|\.tsx?$' <<<"$listado"; then
       detener "$paquete contiene archivos internos"
     fi
     if ! huella=$(huellas "$paquete"); then detener "no se pudo calcular la huella de $paquete"; fi
     if [ "${huella%% *}" != "$HUELLA_ESPERADA" ]; then detener "la huella de $paquete no es la del informe de estabilización"; fi
   done

   # Huellas de solo los paquetes autorizados.
   huellas "${AUTORIZADOS[@]}" > SHA256SUMS.txt
   if [ "$(wc -l < SHA256SUMS.txt | tr -d ' ')" -ne 2 ]; then detener "SHA256SUMS.txt no tiene exactamente dos líneas"; fi
   cat SHA256SUMS.txt
   echo "LISTO: se pueden publicar ${AUTORIZADOS[*]} y SHA256SUMS.txt"
   GUION
   ```

   Sigue solo si termina con «LISTO». Si aparece «DETENER», no publiques: corrige la causa que indica y vuelve a ejecutarlo.
3. **Crea la Release `v0.1.3`** en el repositorio de distribución con estos tres archivos de `.output/` y nada más: `veilix-0.1.3-chrome.zip`, `veilix-0.1.3-edge.zip` y `SHA256SUMS.txt`. Puedes hacerlo desde la web de GitHub o con:

   ```bash
   gh release create v0.1.3 .output/veilix-0.1.3-chrome.zip .output/veilix-0.1.3-edge.zip .output/SHA256SUMS.txt \
     --repo <propietario>/<repositorio-de-distribución> --title "Veilix 0.1.3" --notes-file <notas-de-la-versión>.md
   ```
4. **Comprueba lo publicado.** Los archivos adjuntos deben ser exactamente `veilix-0.1.3-chrome.zip`, `veilix-0.1.3-edge.zip` y `SHA256SUMS.txt`. Descarga también «Source code (zip)» de la Release y comprueba que solo contiene la documentación pública autorizada.

   ```bash
   gh release view v0.1.3 --repo <propietario>/<repositorio-de-distribución> --json assets --jq '.assets[].name'
   ```
5. **Actualiza la sección de descargas del [README](../README.md#-descargar-veilix):**
   - En las filas de Chrome, de Brave, Opera y Vivaldi, y de Edge, sustituye «Publicación pendiente» por el enlace directo. Su estructura es `https://github.com/<propietario>/<repositorio-de-distribución>/releases/download/v0.1.3/veilix-0.1.3-chrome.zip`, y lo mismo con `-edge.zip`.
   - Actualiza el aviso de «Publicación pendiente» con el enlace a la página de la Release.
   - Firefox y Safari no cambian.
6. **Más adelante:**
   - **Firefox:** confirma el identificador provisional `veilix@veilix.app`, firma la extensión en addons.mozilla.org (pública o para distribución propia) y publica el `.xpi` firmado.
   - **Safari:** confirma el identificador provisional `app.veilix.Veilix` y genera y firma la app de macOS con Xcode y una cuenta del Apple Developer Program.
