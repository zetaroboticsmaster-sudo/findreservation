// 서버리스 함수: 브라우저 대신 서버에서 대상 사이트를 가져온다 (CORS 없음)
// 호출: /.netlify/functions/fetch?url=<대상 URL 인코딩>
exports.handler = async (event) => {
  const target = event.queryStringParameters && event.queryStringParameters.url;

  if (!target) {
    return { statusCode: 400, body: 'missing url parameter' };
  }

  // 안전장치: 낚시 예약 사이트만 허용
  const allowed = ['sunsang24.com', 'bluefishingho.co.kr', 'clubsea.co.kr'];
  let host = '';
  try { host = new URL(target).hostname; } catch (e) {
    return { statusCode: 400, body: 'invalid url' };
  }
  if (!allowed.some(d => host === d || host.endsWith('.' + d))) {
    return { statusCode: 403, body: 'domain not allowed: ' + host };
  }

  try {
    const resp = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Referer': `https://${host}/`,
      },
      redirect: 'follow',
    });

    const body = await resp.text();

    return {
      statusCode: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'no-store',
      },
      body,
    };
  } catch (e) {
    return { statusCode: 502, body: 'fetch failed: ' + (e && e.message ? e.message : String(e)) };
  }
};
