const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Fetching https://glvia.com/admin...');
    const html = await fetch('https://glvia.com/admin');
    
    const jsFiles = [];
    const scriptRegex = /<script[^>]*src=["']([^"']*\.js)["'][^>]*>/g;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      let src = match[1];
      if (src.startsWith('/')) src = 'https://glvia.com' + src;
      jsFiles.push(src);
    }
    
    console.log(`Found ${jsFiles.length} JS files.`);
    let foundPlaceholder = false;
    let foundRealKey = false;
    
    for (const file of jsFiles) {
      console.log(`Checking ${file}...`);
      const js = await fetch(file);
      if (js.includes('placeholder.supabase.co')) {
        console.log(`!!! FOUND placeholder.supabase.co IN ${file} !!!`);
        foundPlaceholder = true;
      }
      if (js.includes('lrahbavlcjlnkjjqvuwx.supabase.co')) {
        console.log(`!!! FOUND REAL SUPABASE URL IN ${file} !!!`);
        foundRealKey = true;
      }
    }
    
    if (foundPlaceholder && !foundRealKey) {
      console.log('\nCONCLUSION: The live site was built WITHOUT the .env file and is using placeholder credentials.');
    } else if (foundRealKey) {
      console.log('\nCONCLUSION: The live site HAS the real credentials. The issue might be CORS or Database.');
    } else {
      console.log('\nCONCLUSION: Could not find any Supabase URL strings in the JS bundles.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
