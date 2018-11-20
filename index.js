const sharp = require('sharp');
const {
    blue
} = require("chalk").default
const got = require("got")
const path = require("path")
const fs = require("fs")
const transformImage = sharp().resize(96, 96)

const getImage = async url => {
    try {
        return await got.stream(url)
    } catch (error) {
        console.error(error)
        return null
    }
}

// const sendImage = (url,label)=>{ //todo
//     return getImage(url).pipe(got.stream.post("http://oracleapi.com"))
// }

const webhose = got.extend({
    baseUrl: "http://webhose.io"
})

const getWebhoseData = async (query, requests = 1) => {
    try {
        if (requests < 1) return;
        console.log(requests)
        const {
            next,
            products
        } = JSON.parse((await webhose(query)).body)
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            let name = product.name
            let image = product.images[0]
            if (image) {
                let ext = path.extname(image)
                let buffer = await getImage(image)
                if (buffer) {
                    buffer.pipe(fs.createWriteStream(path.join("images", name + ext))).on("error", (err) => {
                        console.error(err)
                    })
                }
            }

        }
        if (next) getWebhoseData(next, requests - 1)
    } catch (error) {
        console.error(error)
    }
}

getWebhoseData("http://webhose.io/productFilter?token=bd9b12fb-d051-478e-8836-fa2a88849053&format=json&q=category%3Aelectronics%20-name%3AJeans&ts=1534499728377")