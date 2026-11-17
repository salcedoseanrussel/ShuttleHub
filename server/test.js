const { MongoClient, ServerApiVersion } = require('mongodb')

const uri = "mongodb+srv://shuttlehub:shuttlehub123@shuttlehub.hx0ck4s.mongodb.net/?retryWrites=true&w=majority&appName=shuttlehub"

const client = new MongoClient(uri, {
    
    serverApi:{
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }

})

async function run(){

    try{

        await client.connect()

        await client.db("admin").command({ ping: 1 })

        console.log("MongoDB Connected Successfully")

    }finally{

        await client.close()

    }

}

run().catch(console.dir)