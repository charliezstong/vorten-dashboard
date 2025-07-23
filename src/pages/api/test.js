export function GET() {
  return new Response(
    JSON.stringify({
      success: true,
      message: "API funcionando correctamente",
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}