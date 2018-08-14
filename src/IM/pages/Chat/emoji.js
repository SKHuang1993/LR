const emojiTexts = [
    '[微笑]',
    '[撇嘴]',
    '[色]',
    '[发呆]',
    '[得意]',
    '[流泪]',
    '[害羞]',
    '[闭嘴]',
    '[睡]',
    '[大哭]',
    '[尴尬]',
    '[发怒]',
    '[调皮]',
    '[呲牙]',
    '[惊讶]',
    '[难过]',
    '[酷]',
    '[冷汗]',
    '[抓狂]',
    '[吐]',
    '[偷笑]',


    '[可爱]',
    '[白眼]',
    '[傲慢]',
    '[饥饿]',
    '[困]',
    '[惊恐]',
    '[流汗]',
    '[憨笑]',
    '[大兵]',
    '[奋斗]',



    '[咒骂]',
    '[疑问]',
    '[嘘]',
    '[晕]',
    '[折磨]',
    '[衰]',
    '[骷髅]',
    '[敲打]',
    '[再见]',
    '[擦汗]',

    '[抠鼻]',
    '[鼓掌]',
    '[糗大了]',
    '[坏笑]',
    '[左哼哼]',
    '[右哼哼]',
    '[哈欠]',
    '[鄙视]',
    '[委屈]',
    '[快哭了]',

    '[阴险]',
    '[亲亲]',
    '[吓]',
    '[可怜]',
    '[菜刀]',
    '[西瓜]',
    '[啤酒]',
    '[篮球]',
    '[乒乓]',
    '[咖啡]',

    '[饭]',
    '[猪头]',
    '[玫瑰]',
    '[凋谢]',
    '[示爱]',
    '[爱心]',
    '[心碎]',
    '[蛋糕]',
    '[闪电]',
    '[炸弹]',


    '[刀]',
    '[足球]',
    '[瓢虫]',
    '[便便]',
    '[月亮]',
    '[太阳]',
    '[礼物]',
    '[拥抱]',
    '[强]',
    '[弱]',

    '[握手]',
    '[胜利]',
    '[抱拳]',
    '[勾引]',
    '[拳头]',
    '[差劲]',
    '[爱你]',
    '[NO]',
    '[OK]',

];



const emojiImgs = {
    0: require('./emoji/face/0.png'),
    1: require('./emoji/face/1.png'),
    2: require('./emoji/face/2.png'),
    3: require('./emoji/face/3.png'),
    4: require('./emoji/face/4.png'),
    5: require('./emoji/face/5.png'),
    6: require('./emoji/face/6.png'),
    7: require('./emoji/face/7.png'),
    8: require('./emoji/face/8.png'),
    9: require('./emoji/face/9.png'),
    10: require('./emoji/face/10.png'),

    11: require('./emoji/face/11.png'),
    12: require('./emoji/face/12.png'),
    13: require('./emoji/face/13.png'),
    14: require('./emoji/face/14.png'),
    15: require('./emoji/face/15.png'),
    16: require('./emoji/face/16.png'),
    17: require('./emoji/face/17.png'),
    18: require('./emoji/face/18.png'),
    19: require('./emoji/face/19.png'),
    20: require('./emoji/face/20.png'),

    21: require('./emoji/face/21.png'),
    22: require('./emoji/face/22.png'),
    23: require('./emoji/face/23.png'),
    24: require('./emoji/face/24.png'),
    25: require('./emoji/face/25.png'),
    26: require('./emoji/face/26.png'),
    27: require('./emoji/face/27.png'),
    28: require('./emoji/face/28.png'),
    29: require('./emoji/face/29.png'),
    30: require('./emoji/face/30.png'),

    31: require('./emoji/face/31.png'),
    32: require('./emoji/face/32.png'),
    33: require('./emoji/face/33.png'),
    34: require('./emoji/face/34.png'),
    35: require('./emoji/face/35.png'),
    36: require('./emoji/face/36.png'),
    37: require('./emoji/face/37.png'),
    38: require('./emoji/face/38.png'),
    39: require('./emoji/face/39.png'),
    40: require('./emoji/face/40.png'),

    41: require('./emoji/face/41.png'),
    42: require('./emoji/face/42.png'),
    43: require('./emoji/face/43.png'),
    44: require('./emoji/face/44.png'),
    45: require('./emoji/face/45.png'),
    46: require('./emoji/face/46.png'),
    47: require('./emoji/face/47.png'),
    48: require('./emoji/face/48.png'),
    49: require('./emoji/face/49.png'),
    50: require('./emoji/face/50.png'),


    51: require('./emoji/face/51.png'),
    52: require('./emoji/face/52.png'),
    53: require('./emoji/face/53.png'),
    54: require('./emoji/face/54.png'),
    55: require('./emoji/face/55.png'),
    56: require('./emoji/face/56.png'),
    57: require('./emoji/face/57.png'),
    58: require('./emoji/face/58.png'),
    59: require('./emoji/face/59.png'),
    60: require('./emoji/face/60.png'),


    61: require('./emoji/face/61.png'),
    62: require('./emoji/face/62.png'),
    63: require('./emoji/face/63.png'),
    64: require('./emoji/face/64.png'),
    65: require('./emoji/face/65.png'),
    66: require('./emoji/face/66.png'),
    67: require('./emoji/face/67.png'),
    68: require('./emoji/face/68.png'),
    69: require('./emoji/face/69.png'),
    70: require('./emoji/face/70.png'),


    71: require('./emoji/face/71.png'),
    72: require('./emoji/face/72.png'),
    73: require('./emoji/face/73.png'),
    74: require('./emoji/face/74.png'),
    75: require('./emoji/face/75.png'),
    76: require('./emoji/face/76.png'),
    77: require('./emoji/face/77.png'),
    78: require('./emoji/face/78.png'),
    79: require('./emoji/face/79.png'),
    80: require('./emoji/face/80.png'),



    81: require('./emoji/face/81.png'),
    82: require('./emoji/face/82.png'),
    83: require('./emoji/face/83.png'),
    84: require('./emoji/face/84.png'),
    85: require('./emoji/face/85.png'),
    86: require('./emoji/face/86.png'),
    87: require('./emoji/face/87.png'),
    88: require('./emoji/face/88.png'),
    89: require('./emoji/face/89.png'),


}


let map = new Map();
for (let i in emojiTexts ){
    let name = emojiTexts[i];
    map.set(name, emojiImgs[i]);
}


module.exports = {
    texts: emojiTexts,
    img: emojiImgs,
    map:map
};