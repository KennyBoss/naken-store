// ЮKassa для России
export const createYooKassaPayment = async (amount: number, orderId: string) => {
  const auth = Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString('base64')
  
  const payment = {
    amount: { value: amount.toFixed(2), currency: 'RUB' },
    confirmation: { 
      type: 'redirect',
      return_url: `${process.env.NEXTAUTH_URL}/checkout/success?orderId=${orderId}`
    },
    capture: true,
    description: `Заказ #${orderId}`,
    metadata: { orderId }
  }

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Idempotence-Key': crypto.randomUUID(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payment)
  })

  return response.json()
} 