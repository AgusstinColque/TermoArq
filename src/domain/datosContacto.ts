export interface DatosContacto {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  consentimiento: boolean
}
export type Campo = keyof DatosContacto
export type Errores = Partial<Record<Campo, string>>
export function validarDatos(datos: DatosContacto): Errores {
  const errores: Errores = {}
  if (!datos.nombre.trim()) errores.nombre = 'Ingresá tu nombre.'
  else if (datos.nombre.trim().length > 100) errores.nombre = 'Usá hasta 100 caracteres.'
  if (!datos.apellido.trim()) errores.apellido = 'Ingresá tu apellido.'
  else if (datos.apellido.trim().length > 100) errores.apellido = 'Usá hasta 100 caracteres.'
  const correo = datos.correo.trim()
  const telefono = datos.telefono.trim()
  if (!correo && !telefono) errores.correo = 'Ingresá un correo o un teléfono para continuar.'
  else {
    if (correo && (correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))) {
      errores.correo = 'Revisá el correo, por ejemplo nombre@empresa.com.'
    }
    if (telefono && (!/^\+?[\d\s().-]+$/.test(telefono) || telefono.replace(/\D/g, '').length < 7 || telefono.replace(/\D/g, '').length > 15)) {
      errores.telefono = 'Ingresá un teléfono válido con código de área.'
    }
  }
  if (!datos.consentimiento) errores.consentimiento = 'Aceptá los términos y condiciones para continuar.'
  return errores
}




