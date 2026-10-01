import handler from "vinext/server/fetch-handler";

const primaryHost = "mehmetcivanoztrak.com";

function isAutomatedProbe(pathname: string) {
  let decodedPath = pathname;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    // Keep the original pathname when malformed escapes are sent by a scanner.
  }

  return /(^|\/)\.(?:env|git)(?:[/.]|$)/i.test(decodedPath)
    || /\.php(?:\/|$)/i.test(decodedPath)
    || /^\/(?:api\/config|config(?:\.json|\.js)?|js\/env\.js|setup)(?:\/|$)/i.test(decodedPath);
}

export default {
  fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const url = new URL(request.url);

    if (url.hostname === `www.${primaryHost}`) {
      url.hostname = primaryHost;
      return Response.redirect(url.toString(), 308);
    }

    if (isAutomatedProbe(url.pathname)) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return handler.fetch(request, env, context);
  },
};
