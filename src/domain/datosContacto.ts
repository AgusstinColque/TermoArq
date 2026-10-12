export interface DatosContacto {
  nombre: string
  apellido: string
  contacto: string
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
  const contacto = datos.contacto.trim()
  if (!contacto) errores.contacto = 'Ingresá un teléfono o un email.'
  else if (contacto.includes('@')) {
    if (contacto.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto)) {
      errores.contacto = 'Revisá el email, por ejemplo nombre@empresa.com.'
    }
  } else if (!/^\+?[\d\s().-]+$/.test(contacto) || contacto.replace(/\D/g, '').length < 7 || contacto.replace(/\D/g, '').length > 15) {
    errores.contacto = 'Ingresá un teléfono con código de área o un email válido.'
  }
  if (!datos.consentimiento) errores.consentimiento = 'Aceptá los términos y condiciones para continuar.'
  return errores
}




