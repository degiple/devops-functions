module.exports = async function(context, req, ratingItem) {

    console.log(ratingItem);
    context.res = { body: ratingItem };

};