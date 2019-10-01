function logout() {
    var receiptNumber = Math.floor(Math.random() * 100000);
    var data = {
        "commonHeader": {
            "receiptNumber": receiptNumber
        },
        "userID": user_id,
        "tenantID": "210005"
    };
    var header = {
        "X-Map-Api-Access-Token": token
    };

    fetch('https://pascali.info-mapping.com/webservices/publicservice/JsonService.asmx/DeleteToken',
        {
            method: "POST",
            headers: header,
            body: JSON.stringify(data)
        })
        .then(res => res.json().then(data => console.log(data)))
        .catch(error => console.log("Error:", error));
    localStorage.removeItem("access_token");
    localStorage.removeItem("login_time");
    window.location.href = "./index.html";
}

// ログイン処理
function login(res_data, time) {
    console.log(res_data);
    // ログイン失敗のとき
    if (res_data.commonHeader.resultInfomation != 0) {
        console.log("ログイン失敗．", res_data.commonHeader.systemErrorReport);
        // エラーを画面に表示する
        $("#error-space").empty();
        $('#error-space').append(res_data.commonHeader.systemErrorReport);
        return;
    }
    // ログイン処理
    var access_token = res_data.data.accessToken;
    console.log("ログイン成功:", access_token);
    $("#error-space").empty();
    // ユーザー名とアクセストークンをブラウザに保存する
    localStorage.setItem("user_id", res_data.data.userId);
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("login_time", time);
    // マップへリダイレクト
    window.location.href = "./map.html";
}

