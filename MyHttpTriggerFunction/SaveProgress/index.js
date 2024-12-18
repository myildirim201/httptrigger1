module.exports = async function (context, req) {
    context.log('Second HTTP trigger function processed a request.');

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? `Hello, ${name}. This is your second manually created HTTP triggered function!`
        : "This is your second HTTP triggered function. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        status: 200,
        body: responseMessage
    };
};