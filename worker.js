export default {
  async fetch(request, env) {
    const SHOP_KV = env.SHOP_KV;
    const url = new URL(request.url);

    const corsHeader = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeader });
    }

    if (url.pathname === "/api/goods" && request.method === "GET") {
      const kvList = await SHOP_KV.list({ prefix: "goods_" });
      const goodsList = [];
      for (const item of kvList.keys) {
        const goods = await SHOP_KV.get(item.name, "json");
        if (goods) goodsList.push(goods);
      }
      return Response.json({
        code: 200,
        msg: "获取商品成功",
        data: goodsList
      }, { headers: corsHeader });
    }

    if (url.pathname.match(/^\/api\/goods\/\w+$/) && request.method === "GET") {
      const goodsId = url.pathname.split("/").pop();
      const goods = await SHOP_KV.get(`goods_${goodsId}`, "json");
      if (goods) {
        return Response.json({
          code: 200,
          msg: "查询成功",
          data: goods
        }, { headers: corsHeader });
      } else {
        return Response.json({
          code: 404,
          msg: "该商品不存在"
        }, { status: 404, headers: corsHeader });
      }
    }

    if (url.pathname === "/api/goods/save" && request.method === "POST") {
      const body = await request.json();
      const key = `goods_${body.id}`;
      await SHOP_KV.put(key, JSON.stringify(body));
      return Response.json({
        code: 200,
        msg: "商品保存完成"
      }, { headers: corsHeader });
    }

    if (url.pathname === "/api/goods/del" && request.method === "POST") {
      const { id } = await request.json();
      await SHOP_KV.delete(`goods_${id}`);
      return Response.json({
        code: 200,
        msg: "商品已删除"
      }, { headers: corsHeader });
    }

    return Response.json({
      code: 404,
      msg: "接口不存在"
    }, { status: 404, headers: corsHeader });
  }
};