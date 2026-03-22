module.exports = async function (context, req) {
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      ok: true,
      server: "Encendido",
      rtmp: "Activo",
      signal: "Inestable",
      activePlatforms: ["youtube", "twitch"],
      timestamp: new Date().toISOString()
    }
  };
};