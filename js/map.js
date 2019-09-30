var map;

var getUrlVars = function(){
    var vars = {}; 
    var param = location.search.substring(1).split('&');
    for(var i = 0; i < param.length; i++) {
        var keySearch = param[i].search(/=/);
        var key = '';
        if(keySearch != -1) key = param[i].slice(0, keySearch);
        var val = param[i].slice(param[i].indexOf('=', 0) + 1);
        if(key != '') vars[key] = decodeURI(val);
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
                var marker = new google.maps.Marker(markerOptions);

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

    // 現在地ボタンを追加
    if(isMainMap) {
        var getLocBtnDiv = document.createElement('div');
        var getLocBtn = new GetLocBtn(getLocBtnDiv);
    
        getLocBtnDiv.index = 1;
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(getLocBtnDiv);
    
        google.maps.event.addListener(map, 'click', onMapClick);
    }

    if(center != null) {
        map.setZoom(18);
        map.setCenter(center);
    }

    return map;
}

// マップクリック時に発生
function onMapClick(event) {
    const latLng = event.latLng.toString().replace("(", "").replace(")", "").split(", ");
    window.location.href = "./add.html?latitude=" + latLng[0] + "&longitude=" + latLng[1];
}