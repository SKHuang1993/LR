/* 得到日期年月日等加数字后的日期 */
Date.prototype.dateAdd = function (interval, number) {
    var d = new Date(this);
    var k = { 'y': 'FullYear', 'q': 'Month', 'm': 'Month', 'w': 'Date', 'd': 'Date', 'h': 'Hours', 'n': 'Minutes', 's': 'Seconds', 'ms': 'MilliSeconds' };
    var n = { 'q': 3, 'w': 7 };
    eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
    return d;
}
/* 计算两日期相差的日期年月日等 */
Date.prototype.dateDiff = function (interval, objDate2) {
    var d = this, i = {}, t = d.getTime(), t2 = objDate2.getTime();
    i['y'] = objDate2.getFullYear() - d.getFullYear();
    i['q'] = i['y'] * 4 + Math.floor(objDate2.getMonth() / 4) - Math.floor(d.getMonth() / 4);
    i['m'] = i['y'] * 12 + objDate2.getMonth() - d.getMonth();
    i['ms'] = objDate2.getTime() - d.getTime();
    i['w'] = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t + 345600000) / (604800000));
    i['d'] = Math.floor(t2 / 86400000) - Math.floor(t / 86400000);
    i['h'] = Math.floor(t2 / 3600000) - Math.floor(t / 3600000);
    i['n'] = Math.floor(t2 / 60000) - Math.floor(t / 60000);
    i['s'] = Math.floor(t2 / 1000) - Math.floor(t / 1000);
    return i[interval];
}
//+---------------------------------------------------    

//| 取得当前日期所在月的最大天数    

//+---------------------------------------------------    
Date.prototype.maxDayOfDate = function () {
    var nextMonth = this.addMonth(1);
    var nextMonthFirstDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    var thisMonthLastDay = nextMonthFirstDay.addDay(-1);

    return thisMonthLastDay.getDate();
}
//在当前时间上添加年数  
Date.prototype.addYear = function (years) {
    return this.dateAdd('y', years);
};
//在当前时间上添加天数  
Date.prototype.addDay = function (days) {
    return this.dateAdd('d', days);
};
//在当前时间上添加月数  
Date.prototype.addMonth = function (months) {
    return this.dateAdd('m', months);
};
// 获取时间的年月日部分
Date.prototype.getDatePart = function () {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}
// 判断两个日期是否相等
Date.prototype.equals = function (obj) {
    if (obj == null)
        return false;

    return this - obj == 0;
}
Date.prototype.toString = function (mask) {
    if (mask == null)
        mask = 'yyyy-MM-dd HH:mm:ss';

    var d = this;

    if (d == null)
        return '';

    var zeroize = function (value, length) {

        if (!length) length = 2;

        value = String(value);

        for (var i = 0, zeros = ''; i < (length - value.length); i++) {

            zeros += '0';

        }

        return zeros + value;

    };
    //       /"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g
    return mask.replace(/"[^"]*"|'[^']*'|(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])/gi, function ($0) {
        switch ($0) {

            case 'd': return d.getDate();

            case 'dd': return zeroize(d.getDate());

            case 'ddd': return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];

            case 'dddd': return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][d.getDay()];

            case 'M': return d.getMonth() + 1;

            case 'MM': return zeroize(d.getMonth() + 1);

            case 'MMM':
                return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][d.getMonth()];

            case 'MMMM':
                return ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'][d.getMonth()];

            case 'yy': return String(d.getFullYear()).substr(2);

            case 'yyyy': return d.getFullYear();

            case 'h': return d.getHours() % 12;

            case 'hh': return d.getHours();//zeroize(d.getHours() % 12 || 12);

            case 'H': return d.getHours();

            case 'HH': return zeroize(d.getHours());

            case 'm': return d.getMinutes();

            case 'mm': return zeroize(d.getMinutes());

            case 's': return d.getSeconds();

            case 'ss': return zeroize(d.getSeconds());

            case 'l': return zeroize(d.getMilliseconds(), 3);

            case 'L': var m = d.getMilliseconds();

                if (m > 99) m = Math.round(m / 10);

                return zeroize(m);

            case 'tt':
            case 'TT':
                var h = d.getHours();
                //var timeRanges = [
                //    { name: '清晨', start: 0, end: 8 },
                //    { name: '上午', start: 8, end: 11 },
                //    { name: '中午', start: 11, end: 14 },
                //    { name: '下午', start: 14, end: 17 },
                //    { name: '黄昏', start: 17, end: 21 },
                //    { name: '夜晚', start: 21, end: 24 }
                //];

                //for (var i = 0; i < timeRanges.length; i++) {
                //    var tr = timeRanges[i];
                //    if (h >= tr.start && h < tr.end)
                //        return tr.name;
                //}

                if (h < 12) {
                    return '上午';
                }
                else {
                    return '下午';
                }

            case 'Z': return d.toUTCString().match(/[A-Z]+$/);

            // Return quoted strings with the surrounding quotes removed     

            default: return $0.substr(1, $0.length - 2);

        }

    });
};
