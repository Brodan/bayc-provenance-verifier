import * as crypto from 'crypto'
import axios from 'axios'

type BAYCData = {
    provenance: string;
    collection: Metadata[];
}

type Metadata = {
    tokenId: number;
    image: string;
    imageHash: string;
    traits: object;
}

const BAYC_PROVENANCE = 'cc354b3fcacee8844dcc9861004da081f71df9567775b3f3a43412752752c0bf'
const BAYC_METADATA_URL = 'https://ipfs.io/ipfs/Qme57kZ2VuVzcj5sC3tVHFgyyEgBTmAnyTK45YVNxKf6hi'

async function main() {
    const fetchImage = (url: string): Promise<string> => new Promise(async (resolve) => {
        const image = await axios.get(url, { responseType: 'arraybuffer' })
        const hashedImage = crypto.createHash('sha256').update(image.data).digest('hex')
        resolve(hashedImage)
    })

    const response = await axios.get(BAYC_METADATA_URL)
    const data = await response.data as BAYCData
    const hashes: string[] = []

    // get every individual image hash
    for (let index = 0; index < data.collection.length; index++) {
        const hash = await fetchImage(data.collection[index].image)
        hashes.push(hash)
    }

    // make one big string and hash it
    const concatenatedHashString = hashes.join('')
    const result = crypto.createHash('sha256').update(concatenatedHashString).digest('hex')

    // check for a match
    console.log(result === BAYC_PROVENANCE ? 'SUCCESS' : 'FAILURE')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
