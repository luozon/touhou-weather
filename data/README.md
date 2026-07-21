# 行政区划坐标数据

`districts.json` 包含全国省、市、区县的名称、行政代码、层级关系和中心坐标，共 3237 条记录。页面只读取本地文件，不会在运行时请求外部行政区划接口。

数据源：[阿里云 DataV 地理小工具](https://datav.aliyun.com/portal/school/atlas/area_selector)

为适应 Open-Meteo 的 WGS-84 坐标要求，网页会在选中区县后对中国大陆地区的中心坐标进行坐标系转换。中心点只用于天气网格定位，不代表行政边界测绘成果。
