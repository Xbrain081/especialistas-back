import { BaseModel, column } from '@adonisjs/lucid/orm'

export type DiaAtencion = {
  dia: string // Ej: 'Lunes'
  hora_inicio: string // Ej: '08:00'
  hora_fin: string // Ej: '12:00'
}

export default class Especialista extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre_completo: string

  @column()
  declare especialidad: string

  @column()
  declare registro_profesional: string

  @column()
  declare activo: boolean

  @column({
    serialize: (value: DiaAtencion[]) => value,
    prepare: (value: DiaAtencion[]) => JSON.stringify(value),
  })
  declare dias_atencion: DiaAtencion[]
}
