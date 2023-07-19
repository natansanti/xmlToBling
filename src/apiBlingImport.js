const https = require('https');
require('dotenv').config();


async function apiBlingImport(xml) {
  try {
    const apiKey = process.env.BLING_API_KEY;

    const postData = `apikey=${apiKey}&xml=${xml}`;
    const options = {
      hostname: 'bling.com.br',
      path: '/Api/v2/contapagar/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, async (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log(`Response Body:\n${responseData}`);
      });
    });

    req.on('error', (error) => {
      console.error(`Request error: ${error}`);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error(`Erro na importação: ${error}`);
  }
}

module.exports = apiBlingImport;