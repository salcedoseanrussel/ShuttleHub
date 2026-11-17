import jsQR from 'jsqr'

const options = { inversionAttempts: 'attemptBoth' }
const decodePixels = canvas => {
    const pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height)
    return jsQR(pixels.data, pixels.width, pixels.height, options)
}
const decode = canvas => {
    const whole = decodePixels(canvas)
    if (whole) return whole
    // Separate codes can confuse a single-code decoder; inspect each quadrant as well.
    const halfW = Math.floor(canvas.width / 2), halfH = Math.floor(canvas.height / 2)
    const regions = [
        [0, 0, halfW, canvas.height], [halfW, 0, canvas.width - halfW, canvas.height],
        [0, 0, canvas.width, halfH], [0, halfH, canvas.width, canvas.height - halfH],
        [0, 0, halfW, halfH], [halfW, 0, canvas.width - halfW, halfH],
        [0, halfH, halfW, canvas.height - halfH], [halfW, halfH, canvas.width - halfW, canvas.height - halfH]
    ]
    for (const [x, y, width, height] of regions) {
        if (!width || !height) continue
        const tile = document.createElement('canvas')
        tile.width = width
        tile.height = height
        tile.getContext('2d').drawImage(canvas, -x, -y)
        const code = decodePixels(tile)
        if (code) {
            const location = { ...code.location }
            for (const key of ['topLeftCorner', 'topRightCorner', 'bottomLeftCorner', 'bottomRightCorner']) {
                location[key] = { x: code.location[key].x + x, y: code.location[key].y + y }
            }
            return { ...code, location }
        }
    }
    return null
}
const bounds = code => {
    const corners = ['topLeftCorner', 'topRightCorner', 'bottomLeftCorner', 'bottomRightCorner'].map(key => code.location[key])
    return {
        left: Math.min(...corners.map(p => p.x)), top: Math.min(...corners.map(p => p.y)),
        right: Math.max(...corners.map(p => p.x)), bottom: Math.max(...corners.map(p => p.y))
    }
}

// Decode locally; no uploaded image or decoded payment details are sent to a third party.
export function detectAndCropPaymentQr(image) {
    const width = image.naturalWidth || image.width
    const height = image.naturalHeight || image.height
    if (!width || !height || width > 8192 || height > 8192) {
        throw new Error('Choose an image no larger than 8192 pixels on either side.')
    }
    let found, scan, scale
    // A smaller pass handles screenshots efficiently; the second preserves small QR details.
    for (const limit of [1200, 2400]) {
        scale = Math.min(1, limit / Math.max(width, height))
        scan = document.createElement('canvas')
        scan.width = Math.max(1, Math.round(width * scale))
        scan.height = Math.max(1, Math.round(height * scale))
        const ctx = scan.getContext('2d', { willReadFrequently: true })
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, scan.width, scan.height)
        ctx.drawImage(image, 0, 0, scan.width, scan.height)
        found = decode(scan)
        if (found) break
        if (scale === 1) break
    }
    if (!found) throw new Error('No readable QR code detected. Upload a clearer picture containing the complete QR code.')

    const box = bounds(found)
    // Hide the first detected code, then look for a second readable code.
    const ctx = scan.getContext('2d', { willReadFrequently: true })
    const padding = 3
    ctx.fillStyle = '#fff'
    ctx.fillRect(box.left - padding, box.top - padding, box.right - box.left + padding * 2, box.bottom - box.top + padding * 2)
    if (decode(scan)) throw new Error('More than one QR code detected. Upload a picture with only the payment QR you want to use.')

    const left = Math.max(0, Math.floor(box.left / scale))
    const top = Math.max(0, Math.floor(box.top / scale))
    const right = Math.min(width, Math.ceil(box.right / scale))
    const bottom = Math.min(height, Math.ceil(box.bottom / scale))
    const cropWidth = right - left, cropHeight = bottom - top
    const output = document.createElement('canvas')
    output.width = output.height = 512
    const out = output.getContext('2d', { willReadFrequently: true })
    out.fillStyle = '#fff'
    out.fillRect(0, 0, 512, 512)
    // Keep at least four modules of white quiet zone, including for small version-1 codes.
    const modules = 17 + 4 * found.version
    const margin = Math.ceil(512 * 4 / (modules + 8)) + 8
    const fit = (512 - margin * 2) / Math.max(cropWidth, cropHeight)
    const destWidth = cropWidth * fit, destHeight = cropHeight * fit
    out.drawImage(image, left, top, cropWidth, cropHeight, (512 - destWidth) / 2, (512 - destHeight) / 2, destWidth, destHeight)
    const verified = decode(output)
    if (!verified || JSON.stringify(verified.binaryData) !== JSON.stringify(found.binaryData)) {
        throw new Error('The cropped QR could not be read reliably. Upload a sharper, straight-on image.')
    }
    const data = output.toDataURL('image/png')
    // A 512px lossless PNG can exceed the old limit for detailed or noisy QR images.
    if (data.length > 2 * 1024 * 1024) throw new Error('Could not prepare this QR image. Please try the upload again.')
    return data
}
