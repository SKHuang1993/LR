export class NationalityInfo {
    static getList = () => {
        let obj = {
            items: [
                {
                    "code": "GR",
                    "nameEN": "Greece",
                    "firstCharactor": "X",
                    "name": "希腊"
                },
                {
                    "code": "GN",
                    "nameEN": "Guinea",
                    "firstCharactor": "J",
                    "name": "几内亚"
                },
                {
                    "code": "GW",
                    "nameEN": "Guinea-Bissau",
                    "firstCharactor": "J",
                    "name": "几内亚比绍"
                },
                {
                    "code": "TR",
                    "nameEN": "Turkey",
                    "firstCharactor": "T",
                    "name": "土耳其"
                },
                {
                    "code": "TM",
                    "nameEN": "Turkmenistan",
                    "firstCharactor": "T",
                    "name": "土库曼斯坦"
                },
                {
                    "code": "YE",
                    "nameEN": "Yemen",
                    "firstCharactor": "Y",
                    "name": "也门"
                },
                {
                    "code": "MV",
                    "nameEN": "Maldives",
                    "firstCharactor": "M",
                    "name": "马尔代夫"
                },
                {
                    "code": "MT",
                    "nameEN": "Malta",
                    "firstCharactor": "M",
                    "name": "马耳他"
                },
                {
                    "code": "MG",
                    "nameEN": "Madagascar",
                    "firstCharactor": "M",
                    "name": "马达加斯加"
                },
                {
                    "code": "MY",
                    "nameEN": "Malaysia",
                    "firstCharactor": "M",
                    "name": "马来西亚"
                },
                {
                    "code": "ML",
                    "nameEN": "Mali",
                    "firstCharactor": "M",
                    "name": "马里"
                },
                {
                    "code": "MW",
                    "nameEN": "Malawi",
                    "firstCharactor": "M",
                    "name": "马拉维"
                },
                {
                    "code": "MK",
                    "nameEN": "Former Yugoslav Republic of Macedonia",
                    "firstCharactor": "M",
                    "name": "马其顿"
                },
                {
                    "code": "MH",
                    "nameEN": "Marshall Islands",
                    "firstCharactor": "M",
                    "name": "马绍尔群岛"
                },
                {
                    "code": "KY",
                    "nameEN": "Cayman Islands",
                    "firstCharactor": "K",
                    "name": "开曼群岛"
                },
                {
                    "code": "BT",
                    "nameEN": "Bhutan",
                    "firstCharactor": "B",
                    "name": "不丹"
                },
                {
                    "code": "EC",
                    "nameEN": "Ecuador",
                    "firstCharactor": "E",
                    "name": "厄瓜多尔"
                },
                {
                    "code": "ER",
                    "nameEN": "Eritrea",
                    "firstCharactor": "E",
                    "name": "厄立特里亚"
                },
                {
                    "code": "JM",
                    "nameEN": "Jamaica",
                    "firstCharactor": "Y",
                    "name": "牙买加"
                },
                {
                    "code": "BE",
                    "nameEN": "Belgium",
                    "firstCharactor": "B",
                    "name": "比利时"
                },
                {
                    "code": "VU",
                    "nameEN": "Vanuatu",
                    "firstCharactor": "W",
                    "name": "瓦努阿图"
                },
                {
                    "code": "IL",
                    "nameEN": "Israel",
                    "firstCharactor": "Y",
                    "name": "以色列"
                },
                {
                    "code": "JP",
                    "nameEN": "Japan",
                    "firstCharactor": "R",
                    "name": "日本"
                },
                {
                    "code": "TW",
                    "nameEN": "Chinese Taipei",
                    "firstCharactor": "Z",
                    "name": "中国台湾"
                },
                {
                    "code": "CF",
                    "nameEN": "Central African Republic",
                    "firstCharactor": "Z",
                    "name": "中非"
                },
                {
                    "code": "HK",
                    "nameEN": "Hong Kong",
                    "firstCharactor": "Z",
                    "name": "中国香港"
                },
                {
                    "code": "GM",
                    "nameEN": "Gambia",
                    "firstCharactor": "G",
                    "name": "冈比亚"
                },
                {
                    "code": "BJ",
                    "nameEN": "Benin",
                    "firstCharactor": "B",
                    "name": "贝宁"
                },
                {
                    "code": "MU",
                    "nameEN": "Mauritius",
                    "firstCharactor": "M",
                    "name": "毛里求斯"
                },
                {
                    "code": "MR",
                    "nameEN": "Mauritania",
                    "firstCharactor": "M",
                    "name": "毛里塔尼亚"
                },
                {
                    "code": "DK",
                    "nameEN": "Denmark",
                    "firstCharactor": "D",
                    "name": "丹麦"
                },
                {
                    "code": "UG",
                    "nameEN": "Uganda",
                    "firstCharactor": "W",
                    "name": "乌干达"
                },
                {
                    "code": "UA",
                    "nameEN": "Ukraine",
                    "firstCharactor": "W",
                    "name": "乌克兰"
                },
                {
                    "code": "UY",
                    "nameEN": "Uruguay",
                    "firstCharactor": "W",
                    "name": "乌拉圭"
                },
                {
                    "code": "UZ",
                    "nameEN": "Uzbekistan",
                    "firstCharactor": "W",
                    "name": "乌兹别克斯坦"
                },
                {
                    "code": "BB",
                    "nameEN": "Barbados",
                    "firstCharactor": "B",
                    "name": "巴巴多斯"
                },
                {
                    "code": "PG",
                    "nameEN": "Papua New Guinea",
                    "firstCharactor": "B",
                    "name": "巴布亚新几内亚"
                },
                {
                    "code": "BR",
                    "nameEN": "Brazil",
                    "firstCharactor": "B",
                    "name": "巴西"
                },
                {
                    "code": "PY",
                    "nameEN": "guay",
                    "firstCharactor": "B",
                    "name": "巴拉圭"
                },
                {
                    "code": "BH",
                    "nameEN": "Bahrain",
                    "firstCharactor": "B",
                    "name": "巴林"
                },
                {
                    "code": "BS",
                    "nameEN": "Bahamas",
                    "firstCharactor": "B",
                    "name": "巴哈马群岛"
                },
                {
                    "code": "PA",
                    "nameEN": "Panama",
                    "firstCharactor": "B",
                    "name": "巴拿马"
                },
                {
                    "code": "PK",
                    "nameEN": "Pakistan",
                    "firstCharactor": "B",
                    "name": "巴基斯坦"
                },
                {
                    "code": "PS",
                    "nameEN": "Palestine",
                    "firstCharactor": "B",
                    "name": "巴勒斯坦"
                },
                {
                    "code": "CU",
                    "nameEN": "Cuba",
                    "firstCharactor": "G",
                    "name": "古巴"
                },
                {
                    "code": "BF",
                    "nameEN": "Burkina Faso",
                    "firstCharactor": "B",
                    "name": "布基纳法索"
                },
                {
                    "code": "BI",
                    "nameEN": "Burundi",
                    "firstCharactor": "B",
                    "name": "布隆迪"
                },
                {
                    "code": "TL",
                    "nameEN": "Democratic Republic of Timor-Leste",
                    "firstCharactor": "D",
                    "name": "东帝汶"
                },
                {
                    "code": "QA",
                    "nameEN": "Qatar",
                    "firstCharactor": "K",
                    "name": "卡塔尔"
                },
                {
                    "code": "RW",
                    "nameEN": "Rwanda",
                    "firstCharactor": "L",
                    "name": "卢旺达"
                },
                {
                    "code": "LU",
                    "nameEN": "Luxembourg",
                    "firstCharactor": "L",
                    "name": "卢森堡"
                },
                {
                    "code": "TD",
                    "nameEN": "Chad",
                    "firstCharactor": "Z",
                    "name": "乍得"
                },
                {
                    "code": "BY",
                    "nameEN": "Belarus",
                    "firstCharactor": "B",
                    "name": "白俄罗斯"
                },
                {
                    "code": "IN",
                    "nameEN": "India",
                    "firstCharactor": "Y",
                    "name": "印度"
                },
                {
                    "code": "ID",
                    "nameEN": "Indonesia",
                    "firstCharactor": "Y",
                    "name": "印度尼西亚"
                },
                {
                    "code": "LT",
                    "nameEN": "Lithuania",
                    "firstCharactor": "L",
                    "name": "立陶宛"
                },
                {
                    "code": "NE",
                    "nameEN": "Niger",
                    "firstCharactor": "N",
                    "name": "尼日尔"
                },
                {
                    "code": "NG",
                    "nameEN": "Nigeria",
                    "firstCharactor": "N",
                    "name": "尼日利亚"
                },
                {
                    "code": "NI",
                    "nameEN": "Nicaragua",
                    "firstCharactor": "N",
                    "name": "尼加拉瓜"
                },
                {
                    "code": "NP",
                    "nameEN": "Nepal",
                    "firstCharactor": "N",
                    "name": "尼泊尔"
                },
                {
                    "code": "GH",
                    "nameEN": "Ghana",
                    "firstCharactor": "J",
                    "name": "加纳"
                },
                {
                    "code": "CA",
                    "nameEN": "Canada",
                    "firstCharactor": "J",
                    "name": "加拿大"
                },
                {
                    "code": "GA",
                    "nameEN": "Gabon",
                    "firstCharactor": "J",
                    "name": "加蓬"
                },
                {
                    "code": "SM",
                    "nameEN": "San Marino",
                    "firstCharactor": "S",
                    "name": "圣马力诺"
                },
                {
                    "code": "VC",
                    "nameEN": "Saint Vincent and the Grenadines",
                    "firstCharactor": "S",
                    "name": "圣文森特和格林纳丁斯"
                },
                {
                    "code": "LC",
                    "nameEN": "Saint Lucia",
                    "firstCharactor": "S",
                    "name": "圣卢西亚"
                },
                {
                    "code": "ST",
                    "nameEN": "Sao Tome and Principe",
                    "firstCharactor": "S",
                    "name": "圣多美和普林西比"
                },
                {
                    "code": "KN",
                    "nameEN": "Saint Kitts and Nevis",
                    "firstCharactor": "S",
                    "name": "圣基茨和尼维斯"
                },
                {
                    "code": "GY",
                    "nameEN": "Guyana",
                    "firstCharactor": "G",
                    "name": "圭亚那"
                },
                {
                    "code": "DJ",
                    "nameEN": "Djibouti",
                    "firstCharactor": "J",
                    "name": "吉布提"
                },
                {
                    "code": "KG",
                    "nameEN": "Kyrgyzstan",
                    "firstCharactor": "J",
                    "name": "吉尔吉斯斯坦"
                },
                {
                    "code": "LA",
                    "nameEN": "Lao People‘s Democratic Republic",
                    "firstCharactor": "L",
                    "name": "老挝国"
                },
                {
                    "code": "AM",
                    "nameEN": "Armenia",
                    "firstCharactor": "Y",
                    "name": "亚美尼亚"
                },
                {
                    "code": "ES",
                    "nameEN": "Spain",
                    "firstCharactor": "X",
                    "name": "西班牙"
                },
                {
                    "code": "BM",
                    "nameEN": "Bermuda",
                    "firstCharactor": "B",
                    "name": "百慕大"
                },
                {
                    "code": "LI",
                    "nameEN": "Liechtenstein",
                    "firstCharactor": "L",
                    "name": "列支敦士登"
                },
                {
                    "code": "CG",
                    "nameEN": "Congo",
                    "firstCharactor": "G",
                    "name": "刚果共和国"
                },
                {
                    "code": "CD",
                    "nameEN": "Democratic Republic of Congo",
                    "firstCharactor": "G",
                    "name": "刚果民主共和国"
                },
                {
                    "code": "IQ",
                    "nameEN": "Iraq",
                    "firstCharactor": "Y",
                    "name": "伊拉克"
                },
                {
                    "code": "IR",
                    "nameEN": "Islamic Republic of Iran",
                    "firstCharactor": "Y",
                    "name": "伊朗"
                },
                {
                    "code": "GT",
                    "nameEN": "Guatemala",
                    "firstCharactor": "W",
                    "name": "危地马拉"
                },
                {
                    "code": "HU",
                    "nameEN": "Hungary",
                    "firstCharactor": "X",
                    "name": "匈牙利"
                },
                {
                    "code": "DO",
                    "nameEN": "Dominican Republic",
                    "firstCharactor": "D",
                    "name": "多米尼加共和国"
                },
                {
                    "code": "DM",
                    "nameEN": "Dominica",
                    "firstCharactor": "D",
                    "name": "多米尼克"
                },
                {
                    "code": "TG",
                    "nameEN": "Togo",
                    "firstCharactor": "D",
                    "name": "多哥"
                },
                {
                    "code": "IS",
                    "nameEN": "Iceland",
                    "firstCharactor": "B",
                    "name": "冰岛"
                },
                {
                    "code": "GU",
                    "nameEN": "Guam",
                    "firstCharactor": "G",
                    "name": "关岛"
                },
                {
                    "code": "AO",
                    "nameEN": "Angola",
                    "firstCharactor": "A",
                    "name": "安哥拉"
                },
                {
                    "code": "AG",
                    "nameEN": "Antigua and Barbuda",
                    "firstCharactor": "A",
                    "name": "安提瓜和巴布达"
                },
                {
                    "code": "AD",
                    "nameEN": "Andorra",
                    "firstCharactor": "A",
                    "name": "安道尔"
                },
                {
                    "code": "TO",
                    "nameEN": "Tonga",
                    "firstCharactor": "T",
                    "name": "汤加"
                },
                {
                    "code": "JO",
                    "nameEN": "Jordan",
                    "firstCharactor": "Y",
                    "name": "约旦"
                },
                {
                    "code": "GQ",
                    "nameEN": "Equatorial Guinea",
                    "firstCharactor": "C",
                    "name": "赤道几内亚"
                },
                {
                    "code": "FI",
                    "nameEN": "Finland",
                    "firstCharactor": "F",
                    "name": "芬兰"
                },
                {
                    "code": "HR",
                    "nameEN": "Croatia",
                    "firstCharactor": "K",
                    "name": "克罗地亚"
                },
                {
                    "code": "SD",
                    "nameEN": "Sudan",
                    "firstCharactor": "S",
                    "name": "苏丹"
                },
                {
                    "code": "SR",
                    "nameEN": "Suriname",
                    "firstCharactor": "S",
                    "name": "苏里南"
                },
                {
                    "code": "LY",
                    "nameEN": "Libyan Arab Jamahiriya",
                    "firstCharactor": "L",
                    "name": "利比亚"
                },
                {
                    "code": "LR",
                    "nameEN": "Liberia",
                    "firstCharactor": "L",
                    "name": "利比里亚共和国"
                },
                {
                    "code": "BZ",
                    "nameEN": "Belize",
                    "firstCharactor": "B",
                    "name": "伯利兹"
                },
                {
                    "code": "CV",
                    "nameEN": "Cape Verde",
                    "firstCharactor": "F",
                    "name": "佛得角"
                },
                {
                    "code": "CK",
                    "nameEN": "Cook Islands",
                    "firstCharactor": "K",
                    "name": "库克群岛"
                },
                {
                    "code": "SA",
                    "nameEN": "Saudi Arabia",
                    "firstCharactor": "S",
                    "name": "沙特阿拉伯"
                },
                {
                    "code": "DZ",
                    "nameEN": "Algeria",
                    "firstCharactor": "A",
                    "name": "阿尔及利亚"
                },
                {
                    "code": "AL",
                    "nameEN": "Albania",
                    "firstCharactor": "A",
                    "name": "阿尔巴尼亚"
                },
                {
                    "code": "AE",
                    "nameEN": "United Arab Emirates",
                    "firstCharactor": "A",
                    "name": "阿拉伯联合酋长国"
                },
                {
                    "code": "AR",
                    "nameEN": "Argentina",
                    "firstCharactor": "A",
                    "name": "阿根廷"
                },
                {
                    "code": "OM",
                    "nameEN": "Oman",
                    "firstCharactor": "A",
                    "name": "阿曼"
                },
                {
                    "code": "AW",
                    "nameEN": "Aruba",
                    "firstCharactor": "A",
                    "name": "阿鲁巴"
                },
                {
                    "code": "AF",
                    "nameEN": "Afghanistan",
                    "firstCharactor": "A",
                    "name": "阿富汗"
                },
                {
                    "code": "AZ",
                    "nameEN": "Azerbaijan",
                    "firstCharactor": "A",
                    "name": "阿塞拜疆"
                },
                {
                    "code": "NA",
                    "nameEN": "Namibia",
                    "firstCharactor": "N",
                    "name": "纳米比亚"
                },
                {
                    "code": "TZ",
                    "nameEN": "United Republic of Tanzania",
                    "firstCharactor": "T",
                    "name": "坦桑尼亚联合共和国"
                },
                {
                    "code": "LV",
                    "nameEN": "Latvia",
                    "firstCharactor": "L",
                    "name": "拉脱维亚"
                },
                {
                    "code": "GB",
                    "nameEN": "Great Britain",
                    "firstCharactor": "Y",
                    "name": "英国"
                },
                {
                    "code": "VG",
                    "nameEN": "British Virgin Islands",
                    "firstCharactor": "Y",
                    "name": "英属维尔京群岛"
                },
                {
                    "code": "KE",
                    "nameEN": "Kenya",
                    "firstCharactor": "K",
                    "name": "肯尼亚"
                },
                {
                    "code": "RO",
                    "nameEN": "Romania",
                    "firstCharactor": "L",
                    "name": "罗马尼亚"
                },
                {
                    "code": "PW",
                    "nameEN": "Palau",
                    "firstCharactor": "P",
                    "name": "帕劳"
                },
                {
                    "code": "TV",
                    "nameEN": "Tuvalu",
                    "firstCharactor": "T",
                    "name": "图瓦卢"
                },
                {
                    "code": "VE",
                    "nameEN": "Venezuela",
                    "firstCharactor": "W",
                    "name": "委内瑞拉"
                },
                {
                    "code": "SB",
                    "nameEN": "Solomon Islands",
                    "firstCharactor": "S",
                    "name": "所罗门群岛"
                },
                {
                    "code": "FR",
                    "nameEN": "France",
                    "firstCharactor": "F",
                    "name": "法国"
                },
                {
                    "code": "PL",
                    "nameEN": "Poland",
                    "firstCharactor": "B",
                    "name": "波兰"
                },
                {
                    "code": "PR",
                    "nameEN": "Puerto Rico",
                    "firstCharactor": "B",
                    "name": "波多黎各"
                },
                {
                    "code": "BA",
                    "nameEN": "Bosnia and Herzegovina",
                    "firstCharactor": "B",
                    "name": "波斯尼亚和黑塞哥维那"
                },
                {
                    "code": "BD",
                    "nameEN": "Bangladesh",
                    "firstCharactor": "M",
                    "name": "孟加拉国"
                },
                {
                    "code": "BO",
                    "nameEN": "Bolivia",
                    "firstCharactor": "B",
                    "name": "玻利维亚"
                },
                {
                    "code": "NO",
                    "nameEN": "Norway",
                    "firstCharactor": "N",
                    "name": "挪威"
                },
                {
                    "code": "ZA",
                    "nameEN": "South Africa",
                    "firstCharactor": "N",
                    "name": "南非"
                },
                {
                    "code": "KH",
                    "nameEN": "Cambodia",
                    "firstCharactor": "J",
                    "name": "柬埔寨"
                },
                {
                    "code": "KZ",
                    "nameEN": "Kazakhstan",
                    "firstCharactor": "H",
                    "name": "哈萨克斯坦"
                },
                {
                    "code": "KW",
                    "nameEN": "Kuwait",
                    "firstCharactor": "K",
                    "name": "科威特"
                },
                {
                    "code": "CI",
                    "nameEN": "Cote d‘lvoire",
                    "firstCharactor": "K",
                    "name": "科特迪瓦"
                },
                {
                    "code": "KM",
                    "nameEN": "Comoros",
                    "firstCharactor": "K",
                    "name": "科摩罗"
                },
                {
                    "code": "BG",
                    "nameEN": "Bulgaria",
                    "firstCharactor": "B",
                    "name": "保加利亚"
                },
                {
                    "code": "RU",
                    "nameEN": "Russian Federation",
                    "firstCharactor": "E",
                    "name": "俄罗斯"
                },
                {
                    "code": "SY",
                    "nameEN": "Syria Arab Republic",
                    "firstCharactor": "X",
                    "name": "叙利亚"
                },
                {
                    "code": "US",
                    "nameEN": "United States of America",
                    "firstCharactor": "M",
                    "name": "美国"
                },
                {
                    "code": "VI",
                    "nameEN": "Virgin Islands",
                    "firstCharactor": "M",
                    "name": "美属维尔京群岛"
                },
                {
                    "code": "AS",
                    "nameEN": "American Samoa",
                    "firstCharactor": "M",
                    "name": "美属萨摩亚"
                },
                {
                    "code": "HN",
                    "nameEN": "Honduras",
                    "firstCharactor": "H",
                    "name": "洪都拉斯"
                },
                {
                    "code": "ZW",
                    "nameEN": "Zimbabwe",
                    "firstCharactor": "J",
                    "name": "津巴布韦"
                },
                {
                    "code": "TN",
                    "nameEN": "Tunisia",
                    "firstCharactor": "T",
                    "name": "突尼斯"
                },
                {
                    "code": "TH",
                    "nameEN": "Thailand",
                    "firstCharactor": "T",
                    "name": "泰国"
                },
                {
                    "code": "EG",
                    "nameEN": "Egypt",
                    "firstCharactor": "A",
                    "name": "埃及"
                },
                {
                    "code": "ET",
                    "nameEN": "Ethiopia",
                    "firstCharactor": "A",
                    "name": "埃塞俄比亚"
                },
                {
                    "code": "LS",
                    "nameEN": "Lesotho",
                    "firstCharactor": "L",
                    "name": "莱索托"
                },
                {
                    "code": "MZ",
                    "nameEN": "Mozambique",
                    "firstCharactor": "M",
                    "name": "莫桑比克"
                },
                {
                    "code": "NL",
                    "nameEN": "Netherlands",
                    "firstCharactor": "H",
                    "name": "荷兰"
                },
                {
                    "code": "AN",
                    "nameEN": "Netherlands Antilles",
                    "firstCharactor": "H",
                    "name": "荷属安堤尔斯岛"
                },
                {
                    "code": "GD",
                    "nameEN": "Grenada",
                    "firstCharactor": "G",
                    "name": "格林纳达"
                },
                {
                    "code": "GE",
                    "nameEN": "Georgia",
                    "firstCharactor": "G",
                    "name": "格鲁吉亚"
                },
                {
                    "code": "SO",
                    "nameEN": "Somalia",
                    "firstCharactor": "S",
                    "name": "索马里"
                },
                {
                    "code": "CO",
                    "nameEN": "Colombia",
                    "firstCharactor": "G",
                    "name": "哥伦比亚"
                },
                {
                    "code": "CR",
                    "nameEN": "Costa Rica",
                    "firstCharactor": "G",
                    "name": "哥斯达黎加"
                },
                {
                    "code": "TT",
                    "nameEN": "Trinidad and Tobago",
                    "firstCharactor": "T",
                    "name": "特立尼达和多巴哥"
                },
                {
                    "code": "PE",
                    "nameEN": "Peru",
                    "firstCharactor": "M",
                    "name": "秘鲁"
                },
                {
                    "code": "IE",
                    "nameEN": "Ireland",
                    "firstCharactor": "A",
                    "name": "爱尔兰"
                },
                {
                    "code": "EE",
                    "nameEN": "Estonia",
                    "firstCharactor": "A",
                    "name": "爱沙尼亚"
                },
                {
                    "code": "HT",
                    "nameEN": "Haiti",
                    "firstCharactor": "H",
                    "name": "海地"
                },
                {
                    "code": "CZ",
                    "nameEN": "Czech Republic",
                    "firstCharactor": "J",
                    "name": "捷克共和国"
                },
                {
                    "code": "KI",
                    "nameEN": "Kiribati",
                    "firstCharactor": "J",
                    "name": "基列巴斯"
                },
                {
                    "code": "PH",
                    "nameEN": "Philippines",
                    "firstCharactor": "F",
                    "name": "菲律宾"
                },
                {
                    "code": "SV",
                    "nameEN": "El Salvador",
                    "firstCharactor": "S",
                    "name": "萨尔瓦多"
                },
                {
                    "code": "WS",
                    "nameEN": "Samoa",
                    "firstCharactor": "S",
                    "name": "萨摩亚"
                },
                {
                    "code": "FM",
                    "nameEN": "Federated States of Micronesia",
                    "firstCharactor": "M",
                    "name": "密克罗尼西亚联邦"
                },
                {
                    "code": "TJ",
                    "nameEN": "Tajikistan",
                    "firstCharactor": "T",
                    "name": "塔吉克斯坦"
                },
                {
                    "code": "VN",
                    "nameEN": "Vietnam",
                    "firstCharactor": "Y",
                    "name": "越南"
                },
                {
                    "code": "BW",
                    "nameEN": "Botswana",
                    "firstCharactor": "B",
                    "name": "博茨瓦纳"
                },
                {
                    "code": "LK",
                    "nameEN": "Sri Lanka",
                    "firstCharactor": "S",
                    "name": "斯里兰卡"
                },
                {
                    "code": "SZ",
                    "nameEN": "Swaziland",
                    "firstCharactor": "S",
                    "name": "斯威士兰"
                },
                {
                    "code": "SI",
                    "nameEN": "Slovenia",
                    "firstCharactor": "S",
                    "name": "斯洛文尼亚"
                },
                {
                    "code": "SK",
                    "nameEN": "Slovakia",
                    "firstCharactor": "S",
                    "name": "斯洛伐克"
                },
                {
                    "code": "PT",
                    "nameEN": "Portugal",
                    "firstCharactor": "P",
                    "name": "葡萄牙"
                },
                {
                    "code": "KR",
                    "nameEN": "Korea",
                    "firstCharactor": "H",
                    "name": "韩国"
                },
                {
                    "code": "KP",
                    "nameEN": "Democratic People‘s Republic of Korea",
                    "firstCharactor": "C",
                    "name": "朝鲜民主主义人民共和国"
                },
                {
                    "code": "FJ",
                    "nameEN": "Fiji",
                    "firstCharactor": "F",
                    "name": "斐济"
                },
                {
                    "code": "CM",
                    "nameEN": "Cameroon",
                    "firstCharactor": "K",
                    "name": "喀麦隆"
                },
                {
                    "code": "ME",
                    "nameEN": "Republic of Montenegro",
                    "firstCharactor": "H",
                    "name": "黑山共和国"
                },
                {
                    "code": "CL",
                    "nameEN": "Chile",
                    "firstCharactor": "Z",
                    "name": "智利"
                },
                {
                    "code": "AT",
                    "nameEN": "Austria",
                    "firstCharactor": "A",
                    "name": "奥地利"
                },
                {
                    "code": "MM",
                    "nameEN": "Myanmar",
                    "firstCharactor": "M",
                    "name": "缅甸"
                },
                {
                    "code": "CH",
                    "nameEN": "Switzerland",
                    "firstCharactor": "R",
                    "name": "瑞士"
                },
                {
                    "code": "SE",
                    "nameEN": "Sweden",
                    "firstCharactor": "R",
                    "name": "瑞典"
                },
                {
                    "code": "NR",
                    "nameEN": "Nauru",
                    "firstCharactor": "N",
                    "name": "瑙鲁"
                },
                {
                    "code": "MN",
                    "nameEN": "Mongolia",
                    "firstCharactor": "M",
                    "name": "蒙古"
                },
                {
                    "code": "SG",
                    "nameEN": "Singapore",
                    "firstCharactor": "X",
                    "name": "新加坡"
                },
                {
                    "code": "NZ",
                    "nameEN": "New Zealand",
                    "firstCharactor": "X",
                    "name": "新西兰"
                },
                {
                    "code": "IT",
                    "nameEN": "Italy",
                    "firstCharactor": "Y",
                    "name": "意大利"
                },
                {
                    "code": "SN",
                    "nameEN": "Senegal",
                    "firstCharactor": "S",
                    "name": "塞内加尔"
                },
                {
                    "code": "RS",
                    "nameEN": "Republic of Serbia",
                    "firstCharactor": "S",
                    "name": "塞尔维亚共和国"
                },
                {
                    "code": "SC",
                    "nameEN": "Seychelles",
                    "firstCharactor": "S",
                    "name": "塞舌尔"
                },
                {
                    "code": "SL",
                    "nameEN": "Sierra Leone",
                    "firstCharactor": "S",
                    "name": "塞拉利昂"
                },
                {
                    "code": "CY",
                    "nameEN": "Cyprus",
                    "firstCharactor": "S",
                    "name": "塞浦路斯"
                },
                {
                    "code": "MX",
                    "nameEN": "Mexico",
                    "firstCharactor": "M",
                    "name": "墨西哥"
                },
                {
                    "code": "LB",
                    "nameEN": "Lebanon",
                    "firstCharactor": "L",
                    "name": "黎巴嫩"
                },
                {
                    "code": "DE",
                    "nameEN": "Germany",
                    "firstCharactor": "D",
                    "name": "德国"
                },
                {
                    "code": "MD",
                    "nameEN": "Republic of Moldova",
                    "firstCharactor": "M",
                    "name": "摩尔多瓦共和国"
                },
                {
                    "code": "MC",
                    "nameEN": "Monaco",
                    "firstCharactor": "M",
                    "name": "摩纳哥公国"
                },
                {
                    "code": "MA",
                    "nameEN": "Morocco",
                    "firstCharactor": "M",
                    "name": "摩洛哥王国"
                },
                {
                    "code": "AU",
                    "nameEN": "Australia",
                    "firstCharactor": "A",
                    "name": "澳大利亚"
                },
                {
                    "code": "ZM",
                    "nameEN": "Zambia",
                    "firstCharactor": "Z",
                    "name": "赞比亚共和国"
                },
                {
                    "code": "MO",
                    "nameEN": "Macao",
                    "firstCharactor": "Z",
                    "name": "中国澳门"
                },
                {
                    "code": "CN",
                    "nameEN": "China",
                    "firstCharactor": "Z",
                    "name": "中国大陆"
                }
            ]
        }
        return obj;
    }
}