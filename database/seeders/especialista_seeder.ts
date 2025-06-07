import Especialista from '#models/especialista'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  public async run() {
    await Especialista.create({
      nombre_completo: 'Juan Pérez',
      especialidad: 'Cardiología',
      registro_profesional: 'juan.perez@ejemplo.com',
      dias_atencion: [
        {
          dia: 'Lunes',
          hora_inicio: '08:00',
          hora_fin: '12:00',
        },
        {
          dia: 'Miércoles',
          hora_inicio: '14:00',
          hora_fin: '18:00',
        },
      ],
      activo: true,
    })
  }
}
