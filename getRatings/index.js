module.exports = async function(context, req, ratingItems) {
    console.log(ratingItems);
    context.res = { body: ratingItems };
};