const uuidv1 = require('uuid/v1');
const rp = require("request-promise");
require('date-utils');

module.exports = async function(context, req) {

    // JSONペイロードのチェック
    await checkingPayload(req.body)

    // 正常時の処理
    .then(() => {
        // 出力データの作成（JSON）
        let now = new Date();
        let createRatingJSON = {
            "id": uuidv1(),
            "userId": req.body.userId,
            "productId": req.body.productId,
            "locationName": req.body.locationName,
            "rating": req.body.rating,
            "userNotes": req.body.userNotes,
            "timestamp": now.toFormat('YYYY-MM-DD HH24:MI:SS')
        };
        // Cosmos DB へ 出力
        context.bindings.RatingDocumentOut = createRatingJSON;
        // 応答
        context.res = {
            status: 200,
            body: createRatingJSON
        };
    })

    // 異常時の処理
    .catch(err => {
        console.log(err.toString());
        context.res = {
            status: 400,
            body: err.toString()
        };
    });
};

async function checkingPayload(payload) {
    // 非同期に各要素をチェック
    await Promise.all(
            [getProduct(payload.productId), // productIdの存在チェック
                getUser(payload.userId), // userIdの存在チェック
                checkRatingCount(payload.rating) // ratingの範囲チェック
            ])
        .catch(err => {
            throw err;
        });
}

async function checkRatingCount(rating) {
    console.log("req.body.rating : " + rating);
    if (rating < 0 || 5 < rating) {
        throw new Error('You must input rating count 1 ~ 5.');
    }
}

async function getUser(userId) {
    console.log("req.body.userId : " + userId);
    const option = {
        url: "https://serverlessohlondonuser.azurewebsites.net/api/GetUser",
        qs: { "userId": userId },
        json: true
    };
    await rp(option)
        .catch(err => {
            throw err;
        });
}

async function getProduct(productId) {
    console.log("req.body.productId : " + productId);
    const option = {
        url: "https://serverlessohlondonproduct.azurewebsites.net/api/GetProduct",
        qs: { "productId": productId },
        json: true
    };
    await rp(option)
        .catch(err => {
            console.log("productId rp error: " + err);
            throw err;
        });
}