declare module 'qrcode' {
  type QrOptions = {
    width?: number
    margin?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  }

  const QRCode: {
    toDataURL(text: string, options?: QrOptions): Promise<string>
  }

  export default QRCode
}
