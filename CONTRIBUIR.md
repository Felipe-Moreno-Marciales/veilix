# Cómo contribuir a Veilix

Gracias por tu interés en mejorar Veilix. Es una extensión de privacidad para WhatsApp Web, de código abierto con licencia [GPL-3.0 o posterior](LICENSE).

## Antes de empezar

- **Idioma:** el proyecto se escribe en español: la documentación, los comentarios, los textos de la interfaz, los nombres propios del código y los mensajes de *commit*.
- **Reglas del proyecto:** están en [`AGENTS.md`](AGENTS.md) y se aplican igual a personas y a agentes. La documentación técnica está en [`docs/desarrollo.md`](docs/desarrollo.md).
- **Fallos de seguridad:** no los comuniques en una *issue* pública. Sigue [`SEGURIDAD.md`](SEGURIDAD.md).

## Comunicar un fallo o proponer una mejora

Abre una *issue* con:
- la versión de Veilix y el navegador, con su versión y el sistema operativo;
- qué interruptor afecta (nombres, fotos, mensajes recientes, mensajes de la conversación o campo de entrada);
- qué ocurre y qué debería ocurrir.

**Nunca incluyas datos personales:** nada de nombres, teléfonos, mensajes, fotos ni capturas de conversaciones reales. Si hace falta conocer la estructura de WhatsApp Web, ejecuta el diagnóstico anonimizado de [`scripts/`](scripts/) que corresponda y comparte su resultado después de revisarlo.

Las funcionalidades nuevas solo se aceptan si están en el catálogo (`src/funcionalidades/catalogo.ts`). Para cualquier otra, abre antes una *issue* y espera a que se apruebe.

## Reglas que no se negocian

- **Privacidad:** nada de telemetría, analítica ni registro remoto de errores, y ningún dato de WhatsApp sale del navegador. ESLint bloquea `fetch`, `XMLHttpRequest`, `WebSocket` y `EventSource` en `src/`.
- **Mínimo privilegio:** no se añaden permisos sin justificarlos y documentarlos.
- **Solo protección visual:** el difuminado nunca modifica ni elimina el texto ni los nodos de WhatsApp. Solo añade estilos y atributos `data-veilix-*`, y lo retira todo al desactivarse.
- **Seguridad del código:** sin `eval`, `new Function`, `innerHTML`, `dangerouslySetInnerHTML` ni código remoto.
- **Selectores con evidencia:** los selectores de WhatsApp Web solo van en `src/nucleo/difuminado/selectores.ts` y se basan en evidencia real anonimizada. Si algo es una hipótesis, se indica. Nunca se usan clases generadas dinámicamente.
- **Compatibilidad honesta:** una prueba con el DOM simulado no demuestra que algo funcione en WhatsApp Web real.

## Preparar el entorno

Necesitas Node.js 22.12 o posterior, y npm.

```bash
npm install
npm run navegador:instalar   # una vez, para las pruebas en Chromium, Firefox y WebKit
npm run dev                  # extensión en modo desarrollo
```

## Enviar un *pull request*

1. Parte de la rama `development` y envía el *pull request* contra ella, nunca contra `main`.
2. Añade pruebas que cubran el cambio y que fallen sin él.
3. Si cambias `src/`, `public/` o `wxt.config.ts`, actualiza la versión con `npm run version:beta` y regístrala en [`CHANGELOG.md`](CHANGELOG.md).
4. Antes de enviarlo, comprueba que todo termina sin errores:

   ```bash
   npm run compile
   npm run lint
   npm test
   npm run test:navegador
   npm run build:chrome
   npm run test:extension
   npm run version:comprobar
   ```

5. Escribe los mensajes de *commit* en español, con un prefijo convencional (`feat:`, `fix:`, `docs:`, `chore:`, `test:`).

El responsable del proyecto revisa cada *pull request* a mano antes de integrarlo.

## Licencia de las contribuciones

Al enviar una contribución aceptas que se publique con la misma licencia del proyecto, [GPL-3.0 o posterior](LICENSE).
