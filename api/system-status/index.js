module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      ok: true,
      server: "Apagado",
      rtmp: "Detenido",
      signal: "Estable",
      activePlatforms: ["youtube"],
      timestamp: new Date().toISOString()
    }
  };
};