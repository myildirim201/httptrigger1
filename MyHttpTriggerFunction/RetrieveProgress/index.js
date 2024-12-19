const { BlobServiceClient } = require("@azure/storage-blob");
const connectionString = process.env.AzureWebJobsStorage;

module.exports = async function (context, req) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient("progress");

    const blobName = "progress.json";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        let progress = { pageLoads: 0, scratch: 0 };

        // Retrieve progress if file exists
        if (await blockBlobClient.exists()) {
            const downloadResponse = await blockBlobClient.download();
            const downloadedContent = await streamToString(downloadResponse.readableStreamBody);
            progress = JSON.parse(downloadedContent);
        }

        context.res = {
            status: 200,
            body: progress
        };
    } catch (error) {
        context.log("Error:", error.message);
        context.res = { status: 500, body: "Failed to retrieve progress" };
    }
};

async function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk.toString()));
        stream.on("end", () => resolve(chunks.join("")));
        stream.on("error", reject);
    });
}
