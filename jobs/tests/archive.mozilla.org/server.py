import os
import json

from aiohttp import web


host = os.getenv("HOST", "127.0.0.1")
port = int(os.getenv("PORT", "8080"))
root = os.getenv("ROOT", ".")


async def index(request):
    path = request.match_info["path"]
    index_json = os.path.join(root, path, "index.json")
    index_html = os.path.join(root, path, "index.html")

    try:
        data = json.load(open(index_json))
        return web.json_response(data)

    except IOError:
        try:
            data = open(index_html).read()
            return web.Response(text=data)

        except IOError:
            print("'{}' missing.".format(index_json))
            raise web.HTTPNotFound()


def setup_routes(app):
    app.router.add_get("/{path:.+}", index)


if __name__ == "__main__":
    app = web.Application()
    setup_routes(app)
    web.run_app(app, host=host, port=port)
