const { sql, poolPromise } = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadImages() {
    try {
        const pool = await poolPromise;
        const products = (await pool.request().query("SELECT product_id, image_url FROM Product")).recordset;
        
        const uploadDir = path.join(__dirname, '../public/uploads/products');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        console.log(`Starting to download images for ${products.length} products...`);

        for (const product of products) {
            const url = product.image_url;
            if (!url || !url.startsWith('http')) continue;

            try {
                const ext = path.extname(new URL(url).pathname) || '.jpg';
                const filename = `prod_${product.product_id}${ext}`;
                const filePath = path.join(uploadDir, filename);

                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Update DB with local path
                const localUrl = `/uploads/products/${filename}`;
                await pool.request()
                    .input('url', sql.VarChar, localUrl)
                    .input('id', sql.Int, product.product_id)
                    .query("UPDATE Product SET image_url = @url WHERE product_id = @id");

                console.log(`Downloaded: ${filename}`);
            } catch (err) {
                console.error(`Failed to download ${url}:`, err.message);
            }
        }

        console.log('Image download and DB update completed!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        sql.close();
    }
}

downloadImages();
