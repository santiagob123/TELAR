import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type TagQrProps = {
  identifier: string
}

export default function TagQr({ identifier }: TagQrProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [publicUrl, setPublicUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const url = `${window.location.origin}/tag/${encodeURIComponent(identifier)}`
    setPublicUrl(url)
    setError('')

    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
      .then(setImageUrl)
      .catch(() => setError('No se pudo generar el QR.'))
  }, [identifier, isOpen])

  async function copyUrl() {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar la URL.')
    }
  }

  function downloadQr() {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `telar-tag-${identifier}.png`
    link.click()
  }

  return (
    <div className="mt-3 rounded-lg border border-[#dfe7e5] bg-[#f5f8f6] p-3">
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        className="text-xs font-semibold text-[#087f78] hover:underline"
      >
        {isOpen ? 'Ocultar QR' : 'Ver QR'}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {imageUrl ? (
            <img src={imageUrl} alt={`Código QR del TAG ${identifier}`} className="mx-auto h-48 w-48" />
          ) : (
            <p className="muted text-sm">Generando QR...</p>
          )}
          {publicUrl && <p className="break-all text-xs text-[#63717a]">{publicUrl}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={copyUrl} className="text-xs font-semibold text-[#087f78] hover:underline">
              {copied ? 'URL copiada' : 'Copiar URL'}
            </button>
            <button type="button" onClick={downloadQr} disabled={!imageUrl} className="text-xs font-semibold text-[#087f78] hover:underline disabled:opacity-50">
              Descargar QR
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
