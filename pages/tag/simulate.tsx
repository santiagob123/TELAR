import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function SimulateTag(){
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  function go(e:any){ 
    e.preventDefault()
    if(!id.trim()) {
      setError('Ingresa un identificador válido')
      return
    }
    setLoading(true)
    router.push(`/tag/${id}`)
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <p className="eyebrow mb-3">TELAR TAG - SIMULADOR</p>
        <h1 className="text-3xl font-bold">Prueba una experiencia TAG</h1>
        <p className="muted mt-3 leading-7">Introduce un identificador para ver cómo vería la experiencia una persona al acercar su teléfono a un TAG.</p>
      </div>

      <form onSubmit={go} className="space-y-4">
        <div className="surface p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="tag-id">Identificador del TAG</label>
            <input 
              id="tag-id" 
              className="w-full rounded-lg border border-[#cbd9d6] bg-white p-3 outline-none transition focus:border-[#087f78] focus:ring-2 focus:ring-[#d8eea8]" 
              placeholder="Ejemplo: tag1a2b3c4d" 
              value={id} 
              onChange={e=>{setId(e.target.value); setError('')}} 
              autoFocus
            />
            <p className="muted text-xs mt-2">Lo encontrarás en el panel de administración cuando crees un negocio.</p>
            {error && <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          </div>
          <button disabled={loading} className="w-full rounded-lg bg-[#087f78] px-4 py-3 font-semibold text-white transition hover:bg-[#075c59] disabled:cursor-wait disabled:opacity-70">
            {loading ? 'Abriendo experiencia...' : 'Ver experiencia'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link href="/admin/tags" className="text-sm font-semibold text-[#087f78] hover:underline">
          ← Crear un nuevo negocio
        </Link>
      </div>

      {/* Información sobre qué es un TAG */}
      <div className="mt-8 surface p-6 sm:p-8">
        <h2 className="font-semibold mb-4">¿Cómo funciona?</h2>
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="text-[#087f78] font-bold">1.</span>
            <div>
              <strong>Creas un negocio en el panel</strong>
              <p className="muted mt-1">Defines el nombre, descripción, teléfono y WhatsApp.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#087f78] font-bold">2.</span>
            <div>
              <strong>Recibes un TAG único</strong>
              <p className="muted mt-1">Un código especial que puedes asociar a una etiqueta física (un código QR o NFC).</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#087f78] font-bold">3.</span>
            <div>
              <strong>Tu cliente lo escanea</strong>
              <p className="muted mt-1">Al acercar su teléfono, ve la información actualizada de tu negocio.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="text-[#087f78] font-bold">4.</span>
            <div>
              <strong>Puedes cambiar información cuando quieras</strong>
              <p className="muted mt-1">Sin necesidad de cambiar la etiqueta física. El TAG siempre muestra datos actuales.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
