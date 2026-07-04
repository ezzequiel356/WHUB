import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const WFM_BASE = 'https://api.warframe.market/v2';

router.get('/:item', async (req, res) => {
  const slug = req.params.item;

  try {
    const response = await fetch(`${WFM_BASE}/orders/item/${slug}/top`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.json({ precio: null, vendedor: null });
    }

    const json = await response.json();
    const ventas = json?.data?.sell;

    if (!ventas || ventas.length === 0) {
      return res.json({ precio: null, vendedor: null });
    }

    // Filtrar solo los que están ingame y tomar el más barato
    const ingame = ventas.filter(o => o.user.status === 'ingame');
    const mejor = ingame.length > 0 ? ingame[0] : ventas[0];

    res.json({
      precio:   mejor.platinum,
      vendedor: mejor.user.ingameName,
      estado:   mejor.user.status
    });

  } catch (err) {
    console.error('Error consultando warframe.market:', err);
    res.status(500).json({ error: 'Error interno al consultar warframe.market' });
  }
});

export default router;