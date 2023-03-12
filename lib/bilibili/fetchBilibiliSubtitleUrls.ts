import { find, sample } from "~/utils/fp";

export const fetchBilibiliSubtitleUrls = async (
  bvId: string,
  partNumber?: null | string
) => {
  const sessdata = sample(process.env.BILIBILI_SESSION_TOKEN?.split(","));
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    Host: "api.bilibili.com",
    Cookie: `SESSDATA=${sessdata}`,
  };

  const requestUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`;
  console.log(`fetch`, requestUrl);

  const commonConfig: RequestInit = {
    method: "GET",
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers,
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  };
  const response = await fetch(requestUrl, commonConfig);
  const json = await response.json();

  // support multiple parts of video
  if (partNumber) {
    const { aid, pages } = json?.data || {};
    const { cid } = find(pages, { page: Number(partNumber) }) || {};

    // https://api.bilibili.com/x/player/v2?aid=865462240&cid=1035524244
    const pageUrl = `https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`;
    const res = await fetch(pageUrl, commonConfig);
    const j = await res.json();

    // r.data.subtitle.subtitles
    return { subtitle: { list: j.data.subtitle.subtitles } };
  }

  // return json.data.View;
  // { code: -404, message: '啥都木有', ttl: 1 }
  return json.data;
};
