# Publicación de Veilix

> Procedimiento para el propietario: publicar las descargas de Veilix en GitHub Releases. La primera publicación es la estable `0.1.5` (10 de noviembre de 2026), solo para Chrome y Edge. Tiene el mismo código que `0.1.4` y se publica con otro número para que su etiqueta ya incluya la licencia GPL-3.0: la de `v0.1.5` se creó antes del cambio de licencia. Los paquetes de `0.1.2`, `0.1.3` y `0.1.4` se conservan como históricos y no se publican. La sección de descargas para usuarios está en el [README](../README.md#-descargar-veilix).

## Código abierto y repositorio de publicación

El 10 de noviembre de 2026, el propietario decidió publicar Veilix como **código abierto con licencia GPL-3.0** ([`LICENSE`](../LICENSE)), para que cualquiera pueda comprobar que no hay telemetría ni envío de datos. La licencia se aplica también a las versiones anteriores.

Por eso la Release se publica en **el propio repositorio de Veilix**, cuando el propietario lo haga público. Ya no hace falta el repositorio de distribución aislado que preveía la versión anterior de este documento.

| Se adjunta a la Release `v0.1.5` | No se adjunta |
| --- | --- |
| `veilix-0.1.5-chrome.zip` y `veilix-0.1.5-edge.zip` | `veilix-0.1.5-firefox.zip` y `veilix-0.1.5-safari.zip`: son paquetes técnicos, no instalables por usuarios finales |
| `SHA256SUMS.txt`, con las huellas de **solo** esos dos paquetes | `veilix-0.1.5-sources.zip`: es para la revisión de Mozilla; el código ya está en el repositorio |

**Publicaciones posteriores:** el `.xpi` de Firefox, cuando Mozilla lo firme, y la app de Safari, cuando exista y esté firmada.

### Antes de hacer público el repositorio

Hacer público el repositorio expone **todo su historial**: el código, la documentación interna, los diagnósticos y las etiquetas. Es irreversible: lo que alguien descargue ya no se puede retirar.

- **Revisado el 10 de noviembre de 2026:**
  - no hay credenciales, `.env`, claves ni certificados versionados, tampoco en el historial;
  - los commits usan la dirección *noreply* de GitHub del propietario;
  - las dependencias de producción (React) tienen licencia MIT, compatible con la GPL-3.0.
- **Archivos automáticos de GitHub:** cada Release incluye «Source code (zip)» y «Source code (tar.gz)» del repositorio en la etiqueta. Con el código abierto no es un problema.
- **Lo que nunca puede estar en ningún commit ni en la Release:** `.env`, credenciales, tokens ni datos personales (nombres, teléfonos o mensajes reales de WhatsApp). Los diagnósticos solo se comparten anonimizados.

## Prueba de humo del paquete final

Antes de publicar, confirma que el paquete exacto que se va a distribuir conserva el comportamiento aprobado de `0.1.4-beta.1`, que `0.1.5` mantiene sin cambios de código:

1. Descomprime `.output/veilix-0.1.5-chrome.zip` en una carpeta nueva. No uses `.output/chrome-mv3`, que puede contener otra compilación.
2. En Chrome, en `chrome://extensions`, desactiva o quita cualquier otra copia de Veilix. Pulsa «Cargar descomprimida» y elige esa carpeta.
3. Comprueba que el panel de Veilix muestra **«Veilix 0.1.5»**, sin «beta», con el candado y el crédito.
4. Abre WhatsApp Web con los cinco interruptores activos y comprueba que se difuminan:
   - los nombres y las fotos de la lista y de la conversación;
   - las vistas previas, los mensajes y el campo de escritura;
   - «Info. del contacto» y «Nuevo chat».
5. **Llamadas:** en una llamada de voz, el nombre, el estado y la duración del panel deben verse difuminados, y el avatar también. Silenciar, la cámara y colgar deben funcionar. En la conversación, las tarjetas de llamada deben tener el título y el estado difuminados, con el icono nítido.
6. **Menciones:** en un grupo, escribe `@`. Los nombres de los participantes deben verse difuminados, «todos» nítido y los avatares difuminados. Elige una sugerencia con el ratón o con Intro: la mención se inserta bien.
7. **Etiquetas de miembro:** en un grupo con etiquetas, el apodo junto al autor debe verse difuminado, y revelarse con el cursor sobre el mensaje. «Leer más», las reacciones y los demás controles deben seguir nítidos y funcionando.
8. **Revelado:** pasa el cursor por encima y usa Ctrl + Mayús + Espacio. Después desactiva cada interruptor por separado, sin recargar: solo se revela lo suyo.
9. **Si quieres, repite** los pasos 1 a 3 con `veilix-0.1.5-edge.zip` en `edge://extensions`.

## Pasos, cuando lo autorices

1. **Haz público el repositorio de Veilix**, cuando lo decidas: *Settings* → *Danger Zone* → *Change visibility* → *Change to public*. Antes, comprueba en `main` que la licencia y el README están al día y que no hay nada que no deba publicarse:

   ```bash
   git ls-files | grep -iE '(^|/)\.env|\.pem$|\.key$' || echo "sin archivos sensibles"
   head -2 LICENSE               # GNU GENERAL PUBLIC LICENSE, Version 3
   ```
2. **Prepara los paquetes desde la raíz del proyecto Veilix.** El guion se ejecuta en un `bash` aparte, así que cualquier fallo lo detiene sin cerrar tu terminal. Antes de generar `SHA256SUMS.txt` comprueba:
   - que la lista de paquetes es exactamente la autorizada;
   - que cada paquete existe, se puede leer y es la versión `0.1.5`;
   - que su huella SHA-256 es exactamente la del informe de estabilización de `0.1.5`;
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

   # Huella SHA-256 de los paquetes de Chrome y Edge de 0.1.5 (idénticos), del informe de estabilización.
   HUELLA_ESPERADA=48dc03d19d7efd7f72c53908dae9e13ba836f04ae48430ccb873435db0451484

   # Lista explícita de paquetes autorizados (sin comodines: veilix-0.1.5-*.zip incluiría el de fuentes).
   AUTORIZADOS=(veilix-0.1.5-chrome.zip veilix-0.1.5-edge.zip)
   if [ "${AUTORIZADOS[*]}" != "veilix-0.1.5-chrome.zip veilix-0.1.5-edge.zip" ]; then
     detener "la lista de paquetes no es la autorizada: ${AUTORIZADOS[*]}"
   fi

   for paquete in "${AUTORIZADOS[@]}"; do
     if [ ! -f "$paquete" ] || [ ! -s "$paquete" ]; then detener "falta $paquete o está vacío"; fi
     if ! listado=$(unzip -Z1 "$paquete"); then detener "no se pudo leer el listado de $paquete"; fi
     if ! grep -qx 'manifest.json' <<<"$listado"; then detener "$paquete no tiene manifest.json en la raíz"; fi
     if ! manifiesto=$(unzip -p "$paquete" manifest.json); then detener "no se pudo leer el manifiesto de $paquete"; fi
     if ! grep -q '"version": *"0\.1\.5"' <<<"$manifiesto"; then detener "$paquete no es la versión 0.1.5"; fi
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
3. **Crea la Release `v0.1.5`** en el repositorio de Veilix, sobre la etiqueta `v0.1.5` (creada en `main` después de integrar la versión), con estos tres archivos de `.output/` y nada más: `veilix-0.1.5-chrome.zip`, `veilix-0.1.5-edge.zip` y `SHA256SUMS.txt`. Puedes hacerlo desde la web de GitHub o con:

   ```bash
   gh release create v0.1.5 .output/veilix-0.1.5-chrome.zip .output/veilix-0.1.5-edge.zip .output/SHA256SUMS.txt \
     --repo Felipe-Moreno-Marciales/veilix --verify-tag --title "Veilix 0.1.5" --notes-file <notas-de-la-versión>.md
   ```
4. **Comprueba lo publicado.** Los archivos adjuntos deben ser exactamente `veilix-0.1.5-chrome.zip`, `veilix-0.1.5-edge.zip` y `SHA256SUMS.txt`, además de los «Source code» automáticos de GitHub.

   ```bash
   gh release view v0.1.5 --repo Felipe-Moreno-Marciales/veilix --json assets --jq '.assets[].name'
   ```
5. **Actualiza la sección de descargas del [README](../README.md#-descargar-veilix):**
   - En las filas de Chrome, de Brave, Opera y Vivaldi, y de Edge, va el enlace directo. Su estructura es `https://github.com/Felipe-Moreno-Marciales/veilix/releases/download/v0.1.5/veilix-0.1.5-chrome.zip`, y lo mismo con `-edge.zip`.
   - El aviso de la sección enlaza a la página de la Release.
   - Con `0.1.5`, los enlaces se añadieron antes de crear la Release, porque su dirección se conoce de antemano. Comprueba que funcionan después de publicarla.
   - Firefox y Safari no cambian.
6. **Más adelante:**
   - **Firefox:** confirma el identificador provisional `veilix@veilix.app`, firma la extensión en addons.mozilla.org (pública o para distribución propia) y publica el `.xpi` firmado.
   - **Safari:** confirma el identificador provisional `app.veilix.Veilix` y genera y firma la app de macOS con Xcode y una cuenta del Apple Developer Program.
