APIID = '1NrdR4Zusgv8'
APIKey = 'QBDIQLtBu0F87J5buNeYqQ2fywn6hVYA'

export async function getSensorData() { // 최근 데이터(모두)
  const response = await fetch("https://www.imonnit.com/json/SensorList", {
    method: "GET",
    headers: {
      "APIKeyID": APIID,
      "APISecretKey": APIKey,
    }
  });
  if (!response.ok) {
      throw new Error(`Failed to get sensor data: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function getPastData(id, from, to){
  const params = {
      sensorID: id,
      fromDate: from,
      toDate: to
  };
  const paramsString = new URLSearchParams(params).toString();
  let url = "https://www.imonnit.com/json/SensorDataMessages";

  const response = await fetch(`${url}?${paramsString}`, {
    method:"GET",
    headers: {
      "APIKeyID": APIID,
      "APISecretKey": APIKey,
    }
  });
  if (!response.ok) {
      throw new Error(`Failed to get past data: ${response.statusText}`);
  }
  const data = response.json();
  return data;
}
