// ==========================================
// 1. 在这里填入你刚才复制的 32位 API Key！
// ==========================================
const API_KEY = 'b89a8a50dd4144e0abb80f0e292cf2c1'; 

// ==========================================
// 2. 你的专属《东方Project》天气图库映射
// ==========================================
// 我已经根据天气特征，帮你把20位角色全部分配好了！
function getImagesForWeather(weatherText) {
    // 晴天系
    if (weatherText.includes('晴')) return['images/reimu.jpg', 'images/youmu.jpg', 'images/utsuho.jpg', 'images/tenshi.jpg'];
    // 云系（多云/阴）
    if (weatherText.includes('云') || weatherText.includes('阴')) return['images/sakuya.jpg', 'images/reisen.jpg', 'images/sanae.jpg', 'images/patchouli.jpg'];
    // 暴雨/台风系
    if (weatherText.includes('雷') || weatherText.includes('暴雨') || weatherText.includes('台风') || weatherText.includes('大雨')) return['images/iku.jpg', 'images/aya.jpg'];
    // 阵雨系
    if (weatherText.includes('阵雨')) return ['images/yukari.jpg', 'images/suika.jpg'];
    // 普通雨系
    if (weatherText.includes('雨')) return['images/marisa.jpg', 'images/suwako.jpg'];
    // 雪/冰系
    if (weatherText.includes('雪') || weatherText.includes('冰')) return ['images/yuyuko.jpg', 'images/cirno.jpg'];
    // 雾系
    if (weatherText.includes('雾')) return['images/remilia.jpg', 'images/komachi.jpg'];
    // 沙尘系
    if (weatherText.includes('沙') || weatherText.includes('尘')) return ['images/meiling.jpg'];
    // 冰雹
    if (weatherText.includes('雹')) return ['images/alice.jpg'];
    
    // 如果遇到奇怪的天气，默认请出灵梦或天子兜底
    return ['images/reimu.jpg', 'images/tenshi.jpg'];
}

// ==========================================
// 3. 核心功能：获取真实天气并更新网页
// ==========================================
async function fetchRealWeather(lon, lat, cityName) {
    try {
        // 第一步：把网页上的文字变成“加载中...”
        document.getElementById('weather-text').innerText = "观测天象中...";
        if(cityName) document.getElementById('location').innerText = cityName;

        // 第二步：向和风天气发送请求（这里用的是经纬度查询）
        // 使用反引号 ` 可以把变量拼接到网址里
        //const url = `https://api.qweather.com/v7/weather/now?location=${lon},${lat}&key=${API_KEY}`;
        //const url = `https://j744ub9922.re.qweather.com/v7/weather/now?location=${lon},${lat}&key=${API_KEY}`;
        const url = `https://j744ub9922.re.qweatherapi.com/v7/weather/now?location=${lon},${lat}&key=${API_KEY}`;
        // fetch 就是 JavaScript 里的“网络请求使者”
        const response = await fetch(url);
        const data = await response.json(); // 把获取到的数据转换成能读懂的 JSON 格式

        if (data.code === '200') {
            // 第三步：提取我们需要的真实数据！
            const weatherText = data.now.text; // 比如 "多云"
            const temperature = data.now.temp; // 比如 "18"
            
            // 第四步：把真实数据写到网页上
            document.getElementById('weather-text').innerText = weatherText;
            document.getElementById('temperature').innerHTML = `${temperature}<span style="font-size: 40px;">°C</span>`;
            // 注意：免费版和风天气的实时接口没有最高/最低温，我们这里放个固定的或者隐藏它，这里先隐藏
            document.getElementById('temp-range').style.display = 'none';

            // 第五步：根据真实天气，召唤对应的东方少女！
            const availableImages = getImagesForWeather(weatherText);
            const randomIndex = Math.floor(Math.random() * availableImages.length);
            const selectedImage = availableImages[randomIndex];
            
            document.getElementById('main-background').style.backgroundImage = `url('${selectedImage}')`;
        } else {
            alert('获取失败！和风天气返回的错误码是：' + data.code);
            console.log("后台详细数据：", data);
        }
    } catch (error) {
        console.error("网络请求出错了：", error);
        document.getElementById('weather-text').innerText = "异变发生(网络错误)";
    }
}

// ==========================================
// 4. 获取用户当前的地理位置
// ==========================================
function getMyLocation() {
    document.getElementById('weather-text').innerText = "寻找结界入口...";
    
    // 检查浏览器是否支持定位
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // 如果用户允许获取位置，执行这里
            (position) => {
                const lon = position.coords.longitude.toFixed(2); // 经度
                const lat = position.coords.latitude.toFixed(2);  // 纬度
                fetchRealWeather(lon, lat, "你的当前位置");
            },
            // 如果用户拒绝或者定位失败，执行这里（默认给个上海的经纬度兜底）
            (error) => {
                console.log("定位失败，使用默认位置(上海)");
                fetchRealWeather("121.47", "31.23", "上海市 (默认)");
            }
        );
    } else {
        alert("你的浏览器不支持定位功能");
    }
}

// ==========================================
// 5. 网页刚打开时，自动开始执行定位和天气获取！
// ==========================================
getMyLocation();

// （之前的测试按钮功能依然保留，你可以把 index.html 里的按钮删掉了，但如果你想强制测试也可以留着）
//function changeWeather(weatherType, weatherName) {
//    let fakeData = "";
//    if(weatherType === 'sunny') fakeData = "晴";
//    if(weatherType === 'cloudy') fakeData = "多云";
//    if(weatherType === 'rainy') fakeData = "大雨";
    
//    document.getElementById('weather-text').innerText = weatherName + " (测试)";
//    const images = getImagesForWeather(fakeData);
//    document.getElementById('main-background').style.backgroundImage = `url('${images[Math.floor(Math.random() * images.length)]}')`;
//}

// 1. 处理城市切换的逻辑
function handleCityChange() {
    const select = document.getElementById('city-select');
    const value = select.value;

    if (value === 'auto') {
        // 如果选的是自动定位
        getMyLocation();
    } else {
        // 如果选的是具体城市（value 里存的是 "经度,纬度"）
        const coords = value.split(','); // 把字符串拆成数组
        const cityName = select.options[select.selectedIndex].text; // 获取选中的城市名字
        fetchRealWeather(coords[0], coords[1], cityName);
    }
}

// 2. 刷新按钮的逻辑
function refreshWeather() {
    // 直接触发一次城市切换逻辑即可
    handleCityChange();
}