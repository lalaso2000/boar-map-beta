var map;
var loc_pin;

var getUrlVars = function () {
    var vars = {};
    var param = location.search.substring(1).split('&');
    for (var i = 0; i < param.length; i++) {
        var keySearch = param[i].search(/=/);
        var key = '';
        if (keySearch != -1) key = param[i].slice(0, keySearch);
        var val = param[i].slice(param[i].indexOf('=', 0) + 1);
        if (key != '') vars[key] = decodeURI(val);
    }
    return vars;
}

function GetLocBtn(btnDiv) {
    // Set CSS for the btn border.
    var btnUI = document.createElement('div');
    btnUI.style.backgroundColor = '#fff';
    btnUI.style.border = '2px solid #fff';
    btnUI.style.borderRadius = '50%';
    btnUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    btnUI.style.cursor = 'pointer';
    btnUI.style.height = '48px';
    btnUI.style.width = '48px';
    btnUI.style.padding = '0px 0px 0px 0px';
    btnUI.style.margin = '6px 6px 6px 6px';
    btnUI.style.textAlign = 'center';
    btnUI.title = 'Click to recenter the map';
    btnDiv.appendChild(btnUI);

    // Set CSS for the btn interior.
    var btnText = document.createElement('div');
    btnText.style.lineHeight = '38px';
    btnText.style.marginBottom = '3px';
    btnText.style.marginTop = '3px';
    btnText.style.padding = '0px 0px 0px 0px';
    btnText.innerHTML = '<img src="./images/my_location-24px.svg" width="24"/>';
    btnUI.appendChild(btnText);

    // Setup the click event listeners: simply set the map to Chicago.
    btnUI.addEventListener('click', function () {
        getLocation();
    });
}

function getLocation() {
    if (navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
            function (result) {
                console.log("get loc success!");
                if (loc_pin != null) {
                    // 既存のピンを削除
                    loc_pin.setMap(null);
                }
                //現在地の取得成功
                var position = result.coords,
                    radius = position.accuracy,
                    latLng = new google.maps.LatLng(position.latitude, position.longitude);

                // 現在地にカスタムピンを立てる
                var markerOptions = {
                    map: map,
                    position: latLng,
                    icon: {
                        url: './images/myLoc.png',
                        scaledSize: new google.maps.Size(40, 40),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(21, 21)
                    }
                };
                loc_pin = new google.maps.Marker(markerOptions);

                //現在地へマップをズームして移動
                map.setZoom(16);
                map.setCenter(latLng);
            },
            function (error) {
                //取得失敗
                var msg;
                switch (error.code) {
                    case 1: msg = "位置情報の利用が許可されていません"; break;
                    case 2: msg = "位置が判定できません"; break;
                    case 3: msg = "タイムアウトしました"; break;
                }
                alert(msg);
            },
            { enableHighAccuracy: true });
    } else {
        alert("本ブラウザではGeolocationが使えません");
    }
}

// マップ処理
function initMap(isMainMap, center) {
    var my_location = new google.maps.LatLng(35.409528, 136.756466);
    var options = {
        zoom: 15,
        center: my_location,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            mapTypeIds: ['roadmap', 'terrain']
        },
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeId: "roadmap",
    };
    map = new google.maps.Map(document.getElementById('map'), options);

    if (isMainMap) {
        // 現在地ボタンを追加
        var getLocBtnDiv = document.createElement('div');
        var getLocBtn = new GetLocBtn(getLocBtnDiv);
        getLocBtnDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(getLocBtnDiv);

        // 地図を触ったときの処理を追加
        google.maps.event.addListener(map, 'click', onMapClick);
    }

    if (center != null) {
        map.setZoom(18);
        map.setCenter(center);
    }

    // 読み込み完了時にフィーチャ取得
    map.addListener("idle", function () {
        searchFeatures(map);
    });

    return map;
}

// マップクリック時に発生
function onMapClick(event) {
    const latLng = event.latLng.toString().replace("(", "").replace(")", "").split(", ");
    window.location.href = "./add.html?latitude=" + latLng[0] + "&longitude=" + latLng[1];
}

// 表示されている領域のフィーチャを検索する
function searchFeatures(map) {
    // 表示領域を取得する
    var bounds = map.getBounds();
    console.log(bounds);
    var topLat = bounds.oa.g;
    var rightLng = bounds.ka.h;
    var bottomLat = bounds.oa.h;
    var leftLng = bounds.ka.g;
    console.log("top: ", topLat);
    console.log("right: ", rightLng);
    console.log("left: ", leftLng);
    console.log("bottom: ", bottomLat);

    var receiptNumber = Math.floor(Math.random() * 100000);
    var infoWins = [];
    var markers = [];
    var data = {
        "commonHeader": {
            "receiptNumber": receiptNumber
        },
        "layerId": 10000097,
        "inclusion": 1,
        "buffer": 100,
        "srid": 4326,
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [leftLng, topLat],
                    [rightLng, topLat],
                    [rightLng, bottomLat],
                    [leftLng, bottomLat],
                    [leftLng, topLat]
                ]
            ]
        }
    };

    function markerEvent(i) {
        markers[i].addListener('mouseover', function () { // マーカーをクリックしたとき
            infoWins[i].open(map, markers[i]); // 吹き出しの表示
        });

        markers[i].addListener('mouseout', function () {
            infoWins[i].close();
        })
    }

    fetch('https://pascali.info-mapping.com/webservices/publicservice/JsonService.asmx/GetFeaturesByExtent',
        {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Map-Api-Access-Token": token
            },
            body: JSON.stringify(data)
        })
        .then(function (res) {
            var json = res.json().then(data => {
                if (data["commonHeader"]["resultInfomation"] == 1) {
                    console.log(data["commonHeader"]["systemErrorReport"]);
                    return;
                }
                if (data["data"]["features"] != null) {
                    console.log("feature num", data["data"]["features"].length);
                    for (var i = 0; i < data["data"]["features"].length; i++) {
                        const point = data["data"]["features"][i];

                        var latLng = new google.maps.LatLng(point["geometry"]["coordinates"][1], point["geometry"]["coordinates"][0]);

                        var markerOptions = {
                            map: map,
                            position: latLng,
                            title: point["properties"]["ID$"] + ": " + point["properties"]["VALUE_STR"]
                        };
                        var marker = new google.maps.Marker(markerOptions);

                        markers[i] = marker;

                        infoWins[i] = new google.maps.InfoWindow({ // 吹き出しの追加
                            content: (point["properties"]["VALUE_STR"] != "") ? point["properties"]["VALUE_STR"] : "(詳細情報なし)"
                        });
                        markerEvent(i);
                    }
                }
            });
        })
        .catch(error => console.log("Error:", error));
}