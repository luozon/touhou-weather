"use strict";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const DISTRICT_DATA_URL = "data/districts.json";
const STORAGE_LOCATION_KEY = "touhou-weather:last-location";
const STORAGE_CACHE_KEY = "touhou-weather:last-forecast";

const DEFAULT_LOCATION = Object.freeze({
    name: "北京",
    detail: "北京市 · 中国",
    latitude: 39.9042,
    longitude: 116.4074
});

const CHARACTERS = Object.freeze({
    "reimu.jpg": { name: "博丽灵梦", note: "晴空安稳，结界今日也一切正常。" },
    "youmu.jpg": { name: "魂魄妖梦", note: "日光清澈，庭院里的风正适合修行。" },
    "utsuho.jpg": { name: "灵乌路空", note: "阳光能量充足，地底的炉心持续升温。" },
    "tenshi.jpg": { name: "比那名居天子", note: "高空万里无云，天界视野格外开阔。" },
    "sakuya.jpg": { name: "十六夜咲夜", note: "云影掠过红魔馆，时间仍在准确流动。" },
    "reisen.jpg": { name: "铃仙·优昙华院·因幡", note: "云层遮住月光，波长观测稍受影响。" },
    "sanae.jpg": { name: "东风谷早苗", note: "云气聚集在山顶，风祝正在记录变化。" },
    "patchouli.jpg": { name: "帕秋莉·诺蕾姬", note: "云层翻动，图书馆正在观测气压。" },
    "marisa.jpg": { name: "雾雨魔理沙", note: "雨点敲过魔法森林，出门记得带伞。" },
    "suwako.jpg": { name: "洩矢诹访子", note: "水汽充沛，湖泊与田野都得到滋润。" },
    "yukari.jpg": { name: "八云紫", note: "阵雨穿过境界，来去都没有固定踪迹。" },
    "suika.jpg": { name: "伊吹萃香", note: "雨云正在聚散，空气里带着潮湿气息。" },
    "iku.jpg": { name: "永江衣玖", note: "雷云活动明显，请留意最新预警信息。" },
    "aya.jpg": { name: "射命丸文", note: "强对流正在接近，风与云的速度都在上升。" },
    "yuyuko.jpg": { name: "西行寺幽幽子", note: "雪花安静落下，白玉楼染上冬日颜色。" },
    "cirno.jpg": { name: "琪露诺", note: "气温偏低，湖面附近可能出现结冰。" },
    "remilia.jpg": { name: "蕾米莉亚·斯卡蕾特", note: "薄雾笼罩视线，出行请放慢速度。" },
    "komachi.jpg": { name: "小野塚小町", note: "雾气停留在水面，远处轮廓并不清晰。" },
    "alice.jpg": { name: "爱丽丝·玛格特洛依德", note: "冰雹可能突然落下，请尽快进入室内。" },
    "meiling.jpg": { name: "红美铃", note: "风势较强，门前的云正在快速移动。" }
});

const CHARACTER_GROUPS = Object.freeze({
    clear: ["reimu.jpg", "youmu.jpg", "utsuho.jpg", "tenshi.jpg"],
    cloudy: ["sakuya.jpg", "reisen.jpg", "sanae.jpg", "patchouli.jpg"],
    drizzle: ["marisa.jpg", "suwako.jpg"],
    rain: ["marisa.jpg", "suwako.jpg"],
    shower: ["yukari.jpg", "suika.jpg"],
    storm: ["iku.jpg", "aya.jpg"],
    snow: ["yuyuko.jpg", "cirno.jpg"],
    fog: ["remilia.jpg", "komachi.jpg"],
    hail: ["alice.jpg"],
    windy: ["meiling.jpg"]
});

const WEATHER_CODES = Object.freeze({
    0: { text: "晴", symbol: "☀", category: "clear" },
    1: { text: "大部晴朗", symbol: "☀", category: "clear" },
    2: { text: "多云", symbol: "☁", category: "cloudy" },
    3: { text: "阴", symbol: "☁", category: "cloudy" },
    45: { text: "雾", symbol: "≋", category: "fog" },
    48: { text: "雾凇", symbol: "≋", category: "fog" },
    51: { text: "小毛毛雨", symbol: "☂", category: "drizzle" },
    53: { text: "毛毛雨", symbol: "☂", category: "drizzle" },
    55: { text: "强毛毛雨", symbol: "☂", category: "drizzle" },
    56: { text: "冻毛毛雨", symbol: "☂", category: "drizzle" },
    57: { text: "强冻毛毛雨", symbol: "☂", category: "drizzle" },
    61: { text: "小雨", symbol: "☂", category: "rain" },
    63: { text: "中雨", symbol: "☂", category: "rain" },
    65: { text: "大雨", symbol: "☂", category: "rain" },
    66: { text: "冻雨", symbol: "☂", category: "rain" },
    67: { text: "强冻雨", symbol: "☂", category: "rain" },
    71: { text: "小雪", symbol: "❄", category: "snow" },
    73: { text: "中雪", symbol: "❄", category: "snow" },
    75: { text: "大雪", symbol: "❄", category: "snow" },
    77: { text: "米雪", symbol: "❄", category: "snow" },
    80: { text: "小阵雨", symbol: "☂", category: "shower" },
    81: { text: "阵雨", symbol: "☂", category: "shower" },
    82: { text: "强阵雨", symbol: "☂", category: "shower" },
    85: { text: "小阵雪", symbol: "❄", category: "snow" },
    86: { text: "强阵雪", symbol: "❄", category: "snow" },
    95: { text: "雷暴", symbol: "ϟ", category: "storm" },
    96: { text: "雷暴伴冰雹", symbol: "ϟ", category: "hail" },
    99: { text: "强雷暴伴冰雹", symbol: "ϟ", category: "hail" }
});

const elements = {
    body: document.body,
    characterStage: document.querySelector(".character-stage"),
    characterName: document.getElementById("character-name"),
    characterNote: document.getElementById("character-note"),
    localDate: document.getElementById("local-date"),
    locateButton: document.getElementById("locate-button"),
    searchForm: document.getElementById("city-search-form"),
    searchInput: document.getElementById("city-search-input"),
    searchResults: document.getElementById("search-results"),
    districtToggle: document.getElementById("district-toggle"),
    districtPanel: document.getElementById("district-panel"),
    districtClose: document.getElementById("district-close"),
    districtForm: document.getElementById("district-form"),
    provinceSelect: document.getElementById("province-select"),
    citySelect: document.getElementById("city-select"),
    districtSelect: document.getElementById("district-select"),
    districtSubmit: document.querySelector(".district-submit"),
    districtStatus: document.getElementById("district-status"),
    location: document.getElementById("location"),
    locationDetail: document.getElementById("location-detail"),
    updatedAt: document.getElementById("updated-at"),
    temperature: document.getElementById("temperature"),
    weatherSymbol: document.getElementById("weather-symbol"),
    weatherText: document.getElementById("weather-text"),
    todayRange: document.getElementById("today-range"),
    apparentTemperature: document.getElementById("apparent-temperature"),
    humidity: document.getElementById("humidity"),
    wind: document.getElementById("wind"),
    precipitation: document.getElementById("precipitation"),
    cloudCover: document.getElementById("cloud-cover"),
    sunTimes: document.getElementById("sun-times"),
    forecastList: document.getElementById("forecast-list"),
    forecastSummary: document.getElementById("forecast-summary"),
    statusMessage: document.getElementById("status-message")
};

let weatherRequestController = null;
let searchRequestController = null;
let searchTimer = null;
let toastTimer = null;
let currentLocation = DEFAULT_LOCATION;
let weatherRequestSerial = 0;
let districtDataLoaded = false;
let districtDataPromise = null;
const areaIndex = new Map();

function getWeatherInfo(code) {
    return WEATHER_CODES[Number(code)] || { text: "天气状况未知", symbol: "·", category: "cloudy" };
}

function getEffectiveCategory(code, windSpeed) {
    const info = getWeatherInfo(code);
    if (Number(windSpeed) >= 45 && !["storm", "hail"].includes(info.category)) {
        return "windy";
    }
    return info.category;
}

function hashText(text) {
    return Array.from(text).reduce((hash, character) => ((hash * 31) + character.codePointAt(0)) >>> 0, 7);
}

function setCharacter(category, locationName, weatherCode) {
    const group = CHARACTER_GROUPS[category] || CHARACTER_GROUPS.cloudy;
    const dayKey = new Date().toISOString().slice(0, 10);
    const imageName = group[hashText(`${dayKey}:${locationName}:${weatherCode}`) % group.length];
    const character = CHARACTERS[imageName];

    elements.characterStage.style.setProperty("--character-image", `url("images/${imageName}")`);
    elements.characterName.textContent = character.name;
    elements.characterNote.textContent = character.note;
    elements.body.dataset.weather = category === "windy" ? "cloudy" : category;
}

function formatLocalDate() {
    elements.localDate.textContent = new Intl.DateTimeFormat("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long"
    }).format(new Date());
}

function formatNumber(value, fallback = "--") {
    return Number.isFinite(Number(value)) ? Math.round(Number(value)).toString() : fallback;
}

function formatCoordinate(value) {
    return Number(value).toFixed(2);
}

function formatTime(isoTime) {
    if (!isoTime || !isoTime.includes("T")) return "--:--";
    return isoTime.split("T")[1].slice(0, 5);
}

function formatWeekday(dateString, index) {
    if (index === 0) return "今天";
    if (index === 1) return "明天";
    return new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(`${dateString}T12:00:00`));
}

function getWindDirection(degrees) {
    const directions = ["北风", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风"];
    const index = Math.round((Number(degrees) % 360) / 45) % 8;
    return directions[index] || "风向未知";
}

function setLoading(isLoading, message) {
    elements.body.dataset.loading = String(isLoading);
    elements.locateButton.disabled = isLoading;
    elements.locateButton.setAttribute("aria-busy", String(isLoading));
    if (message) elements.updatedAt.textContent = message;
}

function showToast(message, duration = 4200) {
    window.clearTimeout(toastTimer);
    elements.statusMessage.textContent = message;
    elements.statusMessage.hidden = false;
    toastTimer = window.setTimeout(() => {
        elements.statusMessage.hidden = true;
    }, duration);
}

function saveLocation(location) {
    try {
        localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(location));
    } catch (error) {
        console.warn("无法保存位置偏好：", error);
    }
}

function loadLocation() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_LOCATION_KEY));
        if (saved && Number.isFinite(Number(saved.latitude)) && Number.isFinite(Number(saved.longitude))) {
            return saved;
        }
    } catch (error) {
        console.warn("无法读取位置偏好：", error);
    }
    return null;
}

function saveForecastCache(location, data) {
    try {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify({ location, data, savedAt: Date.now() }));
    } catch (error) {
        console.warn("无法缓存天气数据：", error);
    }
}

function loadForecastCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(STORAGE_CACHE_KEY));
        return cached && cached.location && cached.data ? cached : null;
    } catch (error) {
        console.warn("无法读取天气缓存：", error);
        return null;
    }
}

function buildForecastUrl(location) {
    const params = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m"
        ].join(","),
        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "sunrise",
            "sunset",
            "precipitation_probability_max",
            "wind_speed_10m_max"
        ].join(","),
        timezone: "auto",
        forecast_days: "7"
    });
    return `${WEATHER_API}?${params.toString()}`;
}

async function fetchWeather(location, options = {}) {
    if (weatherRequestController) weatherRequestController.abort();
    weatherRequestController = new AbortController();
    const requestSerial = ++weatherRequestSerial;
    currentLocation = location;

    setLoading(true, "正在连接气象站");
    elements.location.textContent = location.name;
    elements.locationDetail.textContent = location.detail || `北纬 ${formatCoordinate(location.latitude)}° · 东经 ${formatCoordinate(location.longitude)}°`;

    try {
        const response = await fetch(buildForecastUrl(location), {
            signal: weatherRequestController.signal
        });
        if (!response.ok) throw new Error(`天气服务返回 ${response.status}`);

        const data = await response.json();
        if (!data.current || !data.daily) throw new Error("天气数据格式不完整");

        renderWeather(location, data);
        saveForecastCache(location, data);
        if (options.persist !== false) saveLocation(location);
    } catch (error) {
        if (error.name === "AbortError") return;

        console.error("获取天气失败：", error);
        const cached = loadForecastCache();
        if (cached) {
            currentLocation = cached.location;
            renderWeather(cached.location, cached.data, true);
            showToast("实时天气暂时无法连接，当前展示上一次成功获取的数据。", 6500);
        } else {
            elements.weatherText.textContent = "暂时无法获取";
            elements.updatedAt.textContent = "请检查网络后重试";
            showToast("天气服务连接失败。请检查网络，或稍后点击城市重新查询。", 6500);
        }
    } finally {
        if (requestSerial === weatherRequestSerial) {
            setLoading(false);
        }
    }
}

function renderWeather(location, data, isCached = false) {
    const current = data.current;
    const daily = data.daily;
    const weather = getWeatherInfo(current.weather_code);
    const category = getEffectiveCategory(current.weather_code, current.wind_speed_10m);

    elements.location.textContent = location.name;
    elements.locationDetail.textContent = location.detail || `北纬 ${formatCoordinate(location.latitude)}° · 东经 ${formatCoordinate(location.longitude)}°`;
    elements.temperature.textContent = formatNumber(current.temperature_2m);
    elements.weatherSymbol.textContent = weather.symbol;
    elements.weatherText.textContent = category === "windy" ? `大风 · ${weather.text}` : weather.text;
    elements.todayRange.textContent = `最高 ${formatNumber(daily.temperature_2m_max[0])}° / 最低 ${formatNumber(daily.temperature_2m_min[0])}°`;
    elements.apparentTemperature.textContent = `${formatNumber(current.apparent_temperature)}°`;
    elements.humidity.textContent = `${formatNumber(current.relative_humidity_2m)}%`;
    elements.wind.textContent = `${getWindDirection(current.wind_direction_10m)} ${formatNumber(current.wind_speed_10m)} km/h`;
    elements.precipitation.textContent = `${Number(current.precipitation || 0).toFixed(1)} mm`;
    elements.cloudCover.textContent = `${formatNumber(current.cloud_cover)}%`;
    elements.sunTimes.textContent = `${formatTime(daily.sunrise[0])} / ${formatTime(daily.sunset[0])}`;
    elements.updatedAt.textContent = isCached ? "上次缓存数据" : `${formatTime(current.time)} 更新`;

    setCharacter(category, location.name, current.weather_code);
    renderForecast(daily);
    updateForecastSummary(daily);
}

function renderForecast(daily) {
    const fragment = document.createDocumentFragment();
    elements.forecastList.replaceChildren();

    daily.time.forEach((date, index) => {
        const weather = getWeatherInfo(daily.weather_code[index]);
        const card = document.createElement("article");
        card.className = "forecast-day";

        const weekday = document.createElement("span");
        weekday.className = "forecast-weekday";
        weekday.textContent = formatWeekday(date, index);

        const icon = document.createElement("span");
        icon.className = "forecast-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = weather.symbol;

        const condition = document.createElement("strong");
        condition.className = "forecast-weather";
        condition.textContent = weather.text;

        const temperature = document.createElement("strong");
        temperature.className = "forecast-temperature";
        temperature.append(`${formatNumber(daily.temperature_2m_max[index])}° `);
        const minimum = document.createElement("em");
        minimum.textContent = `/ ${formatNumber(daily.temperature_2m_min[index])}°`;
        temperature.append(minimum);

        const rain = document.createElement("span");
        rain.className = "forecast-rain";
        rain.textContent = `降水 ${formatNumber(daily.precipitation_probability_max[index], "0")}%`;

        card.append(weekday, icon, condition, temperature, rain);
        fragment.append(card);
    });

    elements.forecastList.append(fragment);
}

function updateForecastSummary(daily) {
    const rainDays = daily.precipitation_probability_max.filter(value => Number(value) >= 50).length;
    const highest = Math.max(...daily.temperature_2m_max.map(Number));
    const lowest = Math.min(...daily.temperature_2m_min.map(Number));

    if (rainDays >= 4) {
        elements.forecastSummary.textContent = `本周雨水较多 · ${lowest.toFixed(0)}° 至 ${highest.toFixed(0)}°`;
    } else if (highest - lowest >= 12) {
        elements.forecastSummary.textContent = `昼夜温差明显 · ${lowest.toFixed(0)}° 至 ${highest.toFixed(0)}°`;
    } else {
        elements.forecastSummary.textContent = `整体温度平稳 · ${lowest.toFixed(0)}° 至 ${highest.toFixed(0)}°`;
    }
}

function buildLocationDetail(result) {
    const parts = [result.admin2, result.admin1, result.country]
        .filter(Boolean)
        .filter((part, index, array) => array.indexOf(part) === index)
        .filter(part => part !== result.name);
    return parts.join(" · ") || "搜索结果";
}

function hideSearchResults() {
    elements.searchResults.hidden = true;
    elements.searchInput.setAttribute("aria-expanded", "false");
}

function showSearchResults(results) {
    elements.searchResults.replaceChildren();

    if (!results.length) {
        const empty = document.createElement("p");
        empty.className = "search-empty";
        empty.textContent = "没有找到这个地点，请尝试输入完整城市名。";
        elements.searchResults.append(empty);
    } else {
        results.forEach(result => {
            const button = document.createElement("button");
            button.className = "search-result";
            button.type = "button";
            button.setAttribute("role", "option");

            const label = document.createElement("span");
            const name = document.createElement("strong");
            const detail = document.createElement("span");
            const coordinates = document.createElement("em");

            name.textContent = result.name;
            detail.textContent = buildLocationDetail(result);
            coordinates.textContent = `${Number(result.latitude).toFixed(1)}°, ${Number(result.longitude).toFixed(1)}°`;
            label.append(name, detail);
            button.append(label, coordinates);

            button.addEventListener("click", () => {
                const location = {
                    name: result.name,
                    detail: buildLocationDetail(result),
                    latitude: Number(result.latitude),
                    longitude: Number(result.longitude)
                };
                elements.searchInput.value = "";
                hideSearchResults();
                fetchWeather(location);
            });

            elements.searchResults.append(button);
        });
    }

    elements.searchResults.hidden = false;
    elements.searchInput.setAttribute("aria-expanded", "true");
}

async function searchCities(query) {
    const keyword = query.trim();
    if (!keyword) {
        hideSearchResults();
        return;
    }

    if (searchRequestController) searchRequestController.abort();
    searchRequestController = new AbortController();

    const params = new URLSearchParams({
        name: keyword,
        count: "10",
        language: "zh",
        format: "json"
    });

    try {
        const response = await fetch(`${GEOCODING_API}?${params.toString()}`, {
            signal: searchRequestController.signal
        });
        if (!response.ok) throw new Error(`地点搜索返回 ${response.status}`);

        const data = await response.json();
        const results = (data.results || []).sort((a, b) => {
            const chinaCodes = ["CN", "HK", "MO", "TW"];
            return Number(chinaCodes.includes(b.country_code)) - Number(chinaCodes.includes(a.country_code));
        });
        showSearchResults(results);
    } catch (error) {
        if (error.name === "AbortError") return;
        console.error("搜索地点失败：", error);
        showToast("地点搜索暂时不可用，请检查网络后重试。", 5000);
    }
}

function setAreaSelectMessage(select, message, disabled = true) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = message;
    select.replaceChildren(option);
    select.disabled = disabled;
}

function populateAreaSelect(select, areas, placeholder) {
    const fragment = document.createDocumentFragment();
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    fragment.append(placeholderOption);

    areas.forEach(area => {
        areaIndex.set(area.adcode, area);
        const option = document.createElement("option");
        option.value = area.adcode;
        option.textContent = area.name;
        fragment.append(option);
    });

    select.replaceChildren(fragment);
    select.disabled = areas.length === 0;
}

async function fetchAreaChildren(adcode) {
    if (!districtDataPromise) {
        districtDataPromise = fetch(DISTRICT_DATA_URL, { cache: "force-cache" })
            .then(response => {
                if (!response.ok) throw new Error(`本地区划数据返回 ${response.status}`);
                return response.json();
            })
            .catch(error => {
                districtDataPromise = null;
                throw error;
            });
    }

    const districtData = await districtDataPromise;
    return districtData[adcode] || [];
}

function transformLatitude(longitude, latitude) {
    let result = -100 + (2 * longitude) + (3 * latitude) + (0.2 * latitude * latitude)
        + (0.1 * longitude * latitude) + (0.2 * Math.sqrt(Math.abs(longitude)));
    result += ((20 * Math.sin(6 * longitude * Math.PI)) + (20 * Math.sin(2 * longitude * Math.PI))) * 2 / 3;
    result += ((20 * Math.sin(latitude * Math.PI)) + (40 * Math.sin(latitude / 3 * Math.PI))) * 2 / 3;
    result += ((160 * Math.sin(latitude / 12 * Math.PI)) + (320 * Math.sin(latitude * Math.PI / 30))) * 2 / 3;
    return result;
}

function transformLongitude(longitude, latitude) {
    let result = 300 + longitude + (2 * latitude) + (0.1 * longitude * longitude)
        + (0.1 * longitude * latitude) + (0.1 * Math.sqrt(Math.abs(longitude)));
    result += ((20 * Math.sin(6 * longitude * Math.PI)) + (20 * Math.sin(2 * longitude * Math.PI))) * 2 / 3;
    result += ((20 * Math.sin(longitude * Math.PI)) + (40 * Math.sin(longitude / 3 * Math.PI))) * 2 / 3;
    result += ((150 * Math.sin(longitude / 12 * Math.PI)) + (300 * Math.sin(longitude / 30 * Math.PI))) * 2 / 3;
    return result;
}

function convertGcj02ToWgs84(longitude, latitude) {
    if (longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271) {
        return { longitude, latitude };
    }

    const earthRadius = 6378245;
    const eccentricity = 0.006693421622965943;
    let latitudeOffset = transformLatitude(longitude - 105, latitude - 35);
    let longitudeOffset = transformLongitude(longitude - 105, latitude - 35);
    const radianLatitude = latitude / 180 * Math.PI;
    let magic = Math.sin(radianLatitude);
    magic = 1 - (eccentricity * magic * magic);
    const squareRootMagic = Math.sqrt(magic);
    latitudeOffset = (latitudeOffset * 180) / ((earthRadius * (1 - eccentricity)) / (magic * squareRootMagic) * Math.PI);
    longitudeOffset = (longitudeOffset * 180) / (earthRadius / squareRootMagic * Math.cos(radianLatitude) * Math.PI);

    return {
        longitude: longitude - longitudeOffset,
        latitude: latitude - latitudeOffset
    };
}

function updateDistrictSubmitState() {
    elements.districtSubmit.disabled = !elements.districtSelect.value;
}

async function loadProvinceOptions() {
    setAreaSelectMessage(elements.provinceSelect, "正在载入省份…");
    elements.districtStatus.textContent = "正在读取全国行政区划，请稍候。";

    try {
        const provinces = await fetchAreaChildren("100000");
        populateAreaSelect(elements.provinceSelect, provinces, "选择省份");
        provinces.forEach(province => areaIndex.set(province.adcode, province));
        districtDataLoaded = true;
        elements.districtStatus.textContent = "选择后将使用区县中心坐标进行网格天气预测。";
    } catch (error) {
        console.error("获取省份列表失败：", error);
        setAreaSelectMessage(elements.provinceSelect, "载入失败，请刷新页面");
        elements.districtStatus.textContent = "本地区划数据未能载入，城市搜索和当前位置仍可正常使用。";
        showToast("区县数据文件载入失败，请强制刷新页面后重试。", 5200);
    }
}

async function handleProvinceChange() {
    const province = areaIndex.get(elements.provinceSelect.value);
    const requestedAdcode = province?.adcode;
    setAreaSelectMessage(elements.citySelect, province ? "正在载入城市…" : "请先选择省份");
    setAreaSelectMessage(elements.districtSelect, "请先选择城市");
    updateDistrictSubmitState();
    if (!province) return;

    elements.districtStatus.textContent = `正在读取${province.name}的行政区划。`;

    try {
        if (province.childrenNum === 0) {
            populateAreaSelect(elements.citySelect, [province], province.name);
            elements.citySelect.value = province.adcode;
            elements.citySelect.disabled = true;
            populateAreaSelect(elements.districtSelect, [province], "选择地区");
            elements.districtStatus.textContent = "该地区暂无下级区县数据，将使用地区中心坐标。";
            return;
        }

        const children = await fetchAreaChildren(province.adcode);
        if (elements.provinceSelect.value !== requestedAdcode) return;
        const cities = children.filter(area => area.level !== "district");
        const directDistricts = children.filter(area => area.level === "district");

        if (cities.length === 0 && directDistricts.length > 0) {
            populateAreaSelect(elements.citySelect, [province], province.name);
            elements.citySelect.value = province.adcode;
            elements.citySelect.disabled = true;
            populateAreaSelect(elements.districtSelect, directDistricts, "选择区 / 县");
        } else {
            populateAreaSelect(elements.citySelect, [...cities, ...directDistricts], "选择城市 / 自治州");
        }

        elements.districtStatus.textContent = "继续选择城市和区县，预测点将定位到所选区域中心。";
    } catch (error) {
        console.error("获取城市列表失败：", error);
        setAreaSelectMessage(elements.citySelect, "城市载入失败");
        elements.districtStatus.textContent = "城市数据载入失败，请重新选择省份。";
        showToast("城市列表载入失败，请稍后重试。", 5000);
    }
}

async function handleCityChange() {
    const city = areaIndex.get(elements.citySelect.value);
    const requestedAdcode = city?.adcode;
    setAreaSelectMessage(elements.districtSelect, city ? "正在载入区县…" : "请先选择城市");
    updateDistrictSubmitState();
    if (!city) return;

    if (city.level === "district" || city.childrenNum === 0) {
        populateAreaSelect(elements.districtSelect, [city], "选择区 / 县");
        elements.districtSelect.value = city.adcode;
        elements.districtStatus.textContent = "已定位到省直辖区县，可以查询天气。";
        updateDistrictSubmitState();
        return;
    }

    elements.districtStatus.textContent = `正在读取${city.name}的区县。`;

    try {
        const districts = await fetchAreaChildren(city.adcode);
        if (elements.citySelect.value !== requestedAdcode) return;
        populateAreaSelect(elements.districtSelect, districts, "选择区 / 县");
        elements.districtStatus.textContent = districts.length
            ? "请选择区或县，预测点将定位到该区域中心。"
            : "该城市暂无区县数据。";
    } catch (error) {
        console.error("获取区县列表失败：", error);
        setAreaSelectMessage(elements.districtSelect, "区县载入失败");
        elements.districtStatus.textContent = "区县数据载入失败，请重新选择城市。";
        showToast("区县列表载入失败，请稍后重试。", 5000);
    }
}

function toggleDistrictPanel(forceOpen) {
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : elements.districtPanel.hidden;
    elements.districtPanel.hidden = !shouldOpen;
    elements.districtToggle.setAttribute("aria-expanded", String(shouldOpen));

    if (shouldOpen && !districtDataLoaded) {
        loadProvinceOptions();
    }
}

function handleDistrictSubmit(event) {
    event.preventDefault();
    const province = areaIndex.get(elements.provinceSelect.value);
    const city = areaIndex.get(elements.citySelect.value);
    const district = areaIndex.get(elements.districtSelect.value);
    const target = district || city || province;

    if (!target || !Array.isArray(target.center) || target.center.length < 2) {
        showToast("请先完整选择省、市和区县。", 4200);
        return;
    }

    const names = [province?.name, city?.name, district?.name]
        .filter(Boolean)
        .filter((name, index, array) => array.indexOf(name) === index);
    const rawCenter = { longitude: Number(target.center[0]), latitude: Number(target.center[1]) };
    const usesWgs84Directly = ["71", "81", "82"].includes(target.adcode.slice(0, 2));
    const converted = usesWgs84Directly
        ? rawCenter
        : convertGcj02ToWgs84(rawCenter.longitude, rawCenter.latitude);

    fetchWeather({
        name: target.name,
        detail: `${names.join(" · ")} · 区县中心点`,
        latitude: Number(converted.latitude.toFixed(5)),
        longitude: Number(converted.longitude.toFixed(5))
    });

    toggleDistrictPanel(false);
    showToast(`已切换到${names.join(" · ")}的中心点预报。`);
}

function useCurrentPosition(options = {}) {
    if (!navigator.geolocation) {
        showToast("当前浏览器不支持定位，已显示默认城市天气。", 5200);
        if (options.fallback) fetchWeather(DEFAULT_LOCATION, { persist: false });
        return;
    }

    setLoading(true, "正在获取当前位置");
    navigator.geolocation.getCurrentPosition(
        position => {
            const location = {
                name: "当前位置",
                detail: `北纬 ${formatCoordinate(position.coords.latitude)}° · 东经 ${formatCoordinate(position.coords.longitude)}°`,
                latitude: Number(position.coords.latitude.toFixed(4)),
                longitude: Number(position.coords.longitude.toFixed(4))
            };
            fetchWeather(location);
        },
        error => {
            console.warn("定位失败：", error);
            setLoading(false);
            if (options.fallback) {
                fetchWeather(DEFAULT_LOCATION, { persist: false });
            } else {
                showToast("无法获取当前位置。请允许定位权限，或直接搜索城市。", 6000);
            }
        },
        { enableHighAccuracy: false, timeout: 9000, maximumAge: 10 * 60 * 1000 }
    );
}

function bindEvents() {
    elements.searchForm.addEventListener("submit", event => {
        event.preventDefault();
        window.clearTimeout(searchTimer);
        searchCities(elements.searchInput.value);
    });

    elements.searchInput.addEventListener("input", () => {
        window.clearTimeout(searchTimer);
        const query = elements.searchInput.value.trim();
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        searchTimer = window.setTimeout(() => searchCities(query), 420);
    });

    elements.searchInput.addEventListener("keydown", event => {
        if (event.key === "Escape") hideSearchResults();
    });

    elements.locateButton.addEventListener("click", () => useCurrentPosition());

    elements.districtToggle.addEventListener("click", () => toggleDistrictPanel());
    elements.districtClose.addEventListener("click", () => toggleDistrictPanel(false));
    elements.provinceSelect.addEventListener("change", handleProvinceChange);
    elements.citySelect.addEventListener("change", handleCityChange);
    elements.districtSelect.addEventListener("change", updateDistrictSubmitState);
    elements.districtForm.addEventListener("submit", handleDistrictSubmit);

    document.querySelectorAll(".quick-cities button").forEach(button => {
        button.addEventListener("click", () => {
            fetchWeather({
                name: button.dataset.name,
                detail: `${button.dataset.name}市 · 中国`,
                latitude: Number(button.dataset.latitude),
                longitude: Number(button.dataset.longitude)
            });
        });
    });

    document.addEventListener("click", event => {
        if (!elements.searchForm.contains(event.target) && !elements.searchResults.contains(event.target)) {
            hideSearchResults();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !elements.districtPanel.hidden) {
            toggleDistrictPanel(false);
            elements.districtToggle.focus();
        }
    });
}

function initialize() {
    formatLocalDate();
    bindEvents();

    const savedLocation = loadLocation();
    if (savedLocation) {
        fetchWeather(savedLocation, { persist: false });
    } else {
        useCurrentPosition({ fallback: true });
    }
}

initialize();
