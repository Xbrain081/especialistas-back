// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import Especialista, { DiaAtencion } from '#models/especialista'

export default class EspecialistasController {
  async index({ request }: HttpContext) {
    const mostrarInactivos = request.qs().inactivos === 'true'
    return await Especialista.query().where('activo', !mostrarInactivos)
  }

  async show({ params, response }: HttpContext) {
    try {
      return await Especialista.findOrFail(params.id)
    } catch {
      return response.status(404).json({ message: 'Especialista no encontrado.' })
    }
  }

  async store({ request, response }: HttpContext) {
    const payload = request.only([
      'nombre_completo',
      'especialidad',
      'registro_profesional',
      'dias_atencion',
    ])

    // Validaciones manuales
    if (!payload.nombre_completo || payload.nombre_completo.trim().length < 3) {
      return response
        .status(400)
        .json({ message: 'El nombre completo debe tener al menos 3 caracteres.' })
    }
    if (!payload.especialidad || payload.especialidad.trim().length === 0) {
      return response.status(400).json({ message: 'La especialidad es obligatoria.' })
    }
    if (!payload.registro_profesional || payload.registro_profesional.trim().length === 0) {
      return response.status(400).json({ message: 'El registro profesional es obligatorio.' })
    }

    const exists = await Especialista.query()
      .where('registro_profesional', payload.registro_profesional)
      .first()
    if (exists) {
      return response.status(400).json({ message: 'El registro profesional ya está en uso.' })
    }

    // Validación de estructura de días y traslapes
    const dias: DiaAtencion[] = payload.dias_atencion || []
    const diasPorDia: Record<string, { inicio: string; fin: string }[]> = {}

    for (const bloque of dias) {
      if (!diasPorDia[bloque.dia]) diasPorDia[bloque.dia] = []
      diasPorDia[bloque.dia].push({ inicio: bloque.hora_inicio, fin: bloque.hora_fin })
    }

    for (const bloques of Object.values(diasPorDia)) {
      bloques.sort((a, b) => a.inicio.localeCompare(b.inicio))
      for (let i = 1; i < bloques.length; i++) {
        if (bloques[i].inicio < bloques[i - 1].fin) {
          return response.status(400).json({
            message: 'Hay traslapes de horario en los días de atención.',
          })
        }
      }
    }

    try {
      const especialista = await Especialista.create({
        nombre_completo: payload.nombre_completo,
        especialidad: payload.especialidad,
        registro_profesional: payload.registro_profesional,
        dias_atencion: dias,
        activo: true,
      })

      return especialista
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Error al crear el especialista.', error: error.message })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const especialista = await Especialista.findOrFail(params.id)
      const payload = request.only([
        'nombre_completo',
        'especialidad',
        'registro_profesional',
        'dias_atencion',
      ])

      // Validaciones
      if (payload.nombre_completo && payload.nombre_completo.trim().length < 3) {
        return response
          .status(400)
          .json({ message: 'El nombre completo debe tener al menos 3 caracteres.' })
      }

      if (payload.especialidad !== undefined && payload.especialidad.trim().length === 0) {
        return response.status(400).json({ message: 'La especialidad es obligatoria.' })
      }

      if (
        payload.registro_profesional !== undefined &&
        payload.registro_profesional.trim().length === 0
      ) {
        return response.status(400).json({ message: 'El registro profesional es obligatorio.' })
      }

      // Validar unicidad si cambia el registro
      if (payload.registro_profesional) {
        const exists = await Especialista.query()
          .where('registro_profesional', payload.registro_profesional)
          .whereNot('id', especialista.id)
          .first()
        if (exists) {
          return response.status(400).json({ message: 'El registro profesional ya está en uso.' })
        }
      }

      // Validar traslapes si se incluye dias_atencion
      if (payload.dias_atencion) {
        const dias: DiaAtencion[] = payload.dias_atencion
        const diasPorDia: Record<string, { inicio: string; fin: string }[]> = {}

        for (const bloque of dias) {
          if (!diasPorDia[bloque.dia]) diasPorDia[bloque.dia] = []
          diasPorDia[bloque.dia].push({ inicio: bloque.hora_inicio, fin: bloque.hora_fin })
        }

        for (const bloques of Object.values(diasPorDia)) {
          bloques.sort((a, b) => a.inicio.localeCompare(b.inicio))
          for (let i = 1; i < bloques.length; i++) {
            if (bloques[i].inicio < bloques[i - 1].fin) {
              return response.status(400).json({
                message: 'Hay traslapes de horario en los días de atención.',
              })
            }
          }
        }
      }

      especialista.merge(payload)
      await especialista.save()
      return especialista
    } catch {
      return response.status(404).json({ message: 'Especialista no encontrado.' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const especialista = await Especialista.findOrFail(params.id)
      especialista.activo = false
      await especialista.save()
      return { deleted: true }
    } catch {
      return response.status(404).json({ message: 'Especialista no encontrado.' })
    }
  }

  async restore({ params, response }: HttpContext) {
    try {
      const especialista = await Especialista.findOrFail(params.id)
      especialista.activo = true
      await especialista.save()
      return { restored: true }
    } catch {
      return response.status(404).json({ message: 'Especialista no encontrado.' })
    }
  }
}
