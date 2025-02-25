import { getForgeToken, listObjects, getManifest, urnify } from './auth';
import { getPastData, getSensorData} from './data';

export async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  const pattern = /^\/api\/models\/([^/]+)\/status$/;
  const match = path.match(pattern);

  function addCorsHeaders(headers) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, id, from, to');
  }

  if (request.method === 'OPTIONS') {
    const headers = new Headers();
    addCorsHeaders(headers);
    return new Response(null, { headers });
  }

  if(path === '/'){
		try{
			const headers = new Headers({ 'Content-Type': 'application/json' });
      addCorsHeaders(headers);
      return new Response(JSON.stringify("Connected with server"), { headers });
		}catch(error){
			const headers = new Headers();
      addCorsHeaders(headers);
      return new Response(error.message, { status: 500, headers });
		}
	}
	else if(path === '/api/auth/token') {
    try {
      const token = await getForgeToken();

      const headers = new Headers({ 'Content-Type': 'application/json' });
      addCorsHeaders(headers);
      return new Response(JSON.stringify(token), { headers });
    } catch (error) {
      const headers = new Headers();
      addCorsHeaders(headers);
      return new Response(error.message, { status: 500, headers });
    }
  }
  else if (path === '/api/models'){ // 모델 모두 가져오기
    try{
      const token = await getForgeToken();
      const objects = await listObjects(token.access_token);
      const res = objects.items.map(o => ({
        name: o.objectKey,
        urn: urnify(o.objectId)
      }));
      const headers = new Headers({ 'Content-Type': 'application/json' });
      addCorsHeaders(headers);
      return new Response(JSON.stringify(res), { headers });
    }catch (error) {
      const headers = new Headers();
      addCorsHeaders(headers);
      return new Response(error.message, { status: 500, headers });
    }
  }
	else if(match){ // /api/models/:urn/status - 모델(revit) 가져오기
    const urn = match[1];
    try{
			const token = await getForgeToken();
      const manifest = await getManifest(urn, token.access_token);
      let res = undefined;

      if (manifest) {
        let messages = [];
        if (manifest.derivatives) {
            for (const derivative of manifest.derivatives) {
                messages = messages.concat(derivative.messages || []);
                if (derivative.children) {
                    for (const child of derivative.children) {
                        messages.concat(child.messages || []);
                    }
                }
            }
        }
        res = { status: manifest.status, progress: manifest.progress, messages };
    } else {
        res = { status: 'n/a' };
    }
      const headers = new Headers({ 'Content-Type': 'application/json' });
      addCorsHeaders(headers);
      return new Response(JSON.stringify(res), { headers });
    } catch (error) {
      const headers = new Headers();
      addCorsHeaders(headers);
      return new Response(error.message, { status: 500, headers });
    }
  }
  else if(path === '/sensor/data'){ // 최근 전체 센서 가져오기
    try {
      const API_data = await getSensorData();

      const headers = new Headers({ 'Content-Type': 'application/json' });
      addCorsHeaders(headers);
      return new Response(JSON.stringify(API_data), { headers });
    } catch (error) {
      const headers = new Headers();
      addCorsHeaders(headers);
      return new Response(error.message, { status: 500, headers });
    }
  }
  else if (path === '/sensor/past') { // 과거 센서 데이터 가져오기
    try {
      let id = request.headers.get('id');
      let from = new Date(request.headers.get('from')).getTime();
      let to = new Date(request.headers.get('to')).getTime();

      const maxDays = 7 * 24 * 60 * 60 * 1000;
      let allData = [];

      function formatDateToString(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      while (from < to) {
        let tempTo = from + maxDays; // from + 7일
        if (tempTo > to) tempTo = to;

        const formattedFrom = formatDateToString(from);
        const formattedTo = formatDateToString(tempTo);

        const past_data = await getPastData(id, formattedFrom, formattedTo);
        // console.log(formattedFrom, formattedTo);

        if (past_data && Array.isArray(past_data.Result)) {
          allData = allData.concat(past_data.Result);
        }
        from = tempTo + 1;
      }

      const headers = new Headers({ 'Content-Type': 'application/json' });
      addCorsHeaders(headers);
      return new Response(JSON.stringify({ Result: allData }), { headers });

    } catch (error) {
      const headers = new Headers();
      addCorsHeaders(headers);
      return new Response(error.message, { status: 500, headers });
    }
  }

}
