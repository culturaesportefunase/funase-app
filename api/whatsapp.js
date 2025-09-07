// api/whatsapp.js (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const token   = process.env.WHATSAPP_TOKEN;     // Defina nas variáveis de ambiente da Vercel
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  const { to, text, template } = req.body || {};
  if (!to) return res.status(400).json({ error: 'Parâmetro "to" é obrigatório' });

  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  const payload = template
    ? { messaging_product: 'whatsapp', to, type: 'template', template }
    : { messaging_product: 'whatsapp', to, type: 'text', text: { body: text || '' } };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  if (!r.ok) return res.status(r.status).json(data);
  res.status(200).json(data);
}
