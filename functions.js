var funct = new Funct();

function Funct() {
    this.jsonEncode = function(data) {
        return JSON.stringify(data);
    };

    this.jsonDecode = function(data) {
        return JSON.parse(data);
    };

    this.dumpError = function(err) {
        if (typeof err === 'object') {
            if (err.message) {
                console.log('\nMessage: ' + err.message);
            }
            if (err.stack) {
                console.log('\nStacktrace:');
                console.log('====================');
                console.log(err.stack);
            }
        } else {
            console.log('dumpError :: argument is not an object');
        }
    };

    this.randomIntFromInterval = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    this.sign = function(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
    };

    this.dateFormat = function(date, fstr, utc) {
        utc = utc ? 'getUTC' : 'get';
        return fstr.replace(/%[YmdHMS]/g, function(m) {
            switch (m) {
                case '%Y':
                    return date[utc + 'FullYear'](); // no leading zeros required
                case '%m':
                    m = 1 + date[utc + 'Month']();
                    break;
                case '%d':
                    m = date[utc + 'Date']();
                    break;
                case '%H':
                    m = date[utc + 'Hours']();
                    break;
                case '%M':
                    m = date[utc + 'Minutes']();
                    break;
                case '%S':
                    m = date[utc + 'Seconds']();
                    break;
                default:
                    return m.slice(1); // unknown code, remove %
            }
            // add leading zero if required
            return ('0' + m).slice(-2);
        });
    };
}

module.exports = funct;