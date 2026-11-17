function validatePaymentInstructions(input = {}) {
    const text = field => typeof input?.[field] === 'string' ? input[field].trim() : ''
    const method = text('method'), accountName = text('accountName'), accountNumber = text('accountNumber'), qrCode = text('qrCode')
    if (!method || method.length > 100 || accountName.length > 200 || accountNumber.length > 100) {
        return { error: 'Enter a payment method and valid account details' }
    }
    if (!qrCode && (!accountName || !accountNumber)) {
        return { error: 'Provide an account name and number, a payment QR, or both' }
    }
    if (qrCode) {
        if (qrCode.length > 2 * 1024 * 1024 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(qrCode)) {
            return { error: 'Upload a valid payment QR image using the QR preview' }
        }
        const bytes = Buffer.from(qrCode.split(',')[1], 'base64')
        if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
            return { error: 'Invalid QR image format' }
        }
    }
    return { value: { method, accountName, accountNumber, qrCode } }
}
module.exports = validatePaymentInstructions
