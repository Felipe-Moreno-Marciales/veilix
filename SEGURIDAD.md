# Política de seguridad

Veilix es una extensión de privacidad, así que un fallo de seguridad puede exponer justo lo que intenta proteger. Si encuentras uno, gracias por avisar de forma responsable.

## Versiones con soporte

Solo la última versión estable recibe correcciones de seguridad.

| Versión | Soporte |
| --- | --- |
| `0.1.6` (última estable) | ✅ |
| Anteriores (`0.1.5` y previas) | ❌: actualiza a la última |

## Cómo informar de una vulnerabilidad

**No abras una *issue* pública** ni publiques los detalles hasta que el fallo esté corregido.

1. Entra en la pestaña **«Security»** del repositorio y pulsa **«Report a vulnerability»**. El aviso llega solo al responsable del proyecto.
2. Incluye:
   - la versión de Veilix y el navegador, con su versión y el sistema operativo;
   - qué ocurre y qué debería ocurrir;
   - los pasos para reproducirlo.
3. **No incluyas datos personales reales:** nada de nombres, teléfonos, mensajes ni capturas de conversaciones de WhatsApp. Si necesitas mostrar la estructura de la página, usa los diagnósticos anonimizados de [`scripts/`](scripts/) o datos inventados.

Recibirás una respuesta en cuanto sea posible. Si el fallo se confirma, se corregirá en una versión nueva y se mencionará en el [historial de versiones](CHANGELOG.md), con tu nombre si lo deseas.

## Qué se considera una vulnerabilidad

- Que Veilix envíe cualquier dato fuera del navegador. Veilix no tiene servidores, telemetría ni analítica.
- Que lea o guarde conversaciones fuera de lo descrito en el [README](README.md#privacidad).
- Que ejecute código remoto o permita inyectar código en la página.
- Que pida o use permisos que no necesita.

**Un dato que queda visible sin difuminar** (por ejemplo, tras un cambio de diseño de WhatsApp Web) no es una vulnerabilidad de seguridad. Es un fallo de la protección visual: comunícalo con una *issue* normal, sin datos personales. La guía está en [`CONTRIBUIR.md`](CONTRIBUIR.md).

## Fuera del alcance

- Fallos de WhatsApp, de WhatsApp Web o del navegador, que deben comunicarse a sus responsables.
- Copias de Veilix modificadas o descargadas de otros sitios. Las descargas oficiales están en las [Releases](https://github.com/Felipe-Moreno-Marciales/veilix/releases) de este repositorio.
