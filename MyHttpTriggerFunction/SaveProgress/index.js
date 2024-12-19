const { BlobServiceClient } = require("@azure/storage-blob");
const connectionString = process.env.AzureWebJobsStorage;

module.exports = async function (context, req) {
    const { eventType, count } = req.body || {};
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient("progress");

    let progress = { pageLoads: 0, scratch: 0 };

    try {
        const blobName = "progress.json";
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if file exists and download existing progress
        if (await blockBlobClient.exists()) {
            const downloadResponse = await blockBlobClient.download();
            const downloadedContent = await streamToString(downloadResponse.readableStreamBody);
            progress = JSON.parse(downloadedContent);
        }

        // Update progress based on event type
        if (eventType === "pageLoad") {
            progress.pageLoads++;
        } else if (eventType === "scratch") {
            progress.scratch = count;
        }

        // Upload updated progress
        const data = JSON.stringify(progress);
        await blockBlobClient.upload(data, Buffer.byteLength(data));

        context.res = {
            status: 200,
            body: { message: "Progress saved successfully", progress }
        };
    } catch (error) {
        context.log("Error:", error.message);
        context.res = { status: 500, body: "Failed to save progress" };
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
