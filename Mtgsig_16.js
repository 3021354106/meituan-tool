const http = require('http');


function Mtgsig_init(dfpid, wxstr) {
    function Q(e, a) {
        return e(a = {
            exports: {}
        }, a['exports']),
            a['exports']
    }

    ha = Q(function (e) {
        function a(e, a, t) {
            if (4 !== a.length) throw new c.exception.invalid("11");
            var n = e.g[t],
                f = a[0] ^ n[0],
                r = a[t ? 3 : 1] ^ n[1],
                d = a[2] ^ n[2];
            a = a[t ? 1 : 3] ^ n[3];
            var i,
                o,
                b = n.length / 4 - 2,
                s = 4,
                u = [0, 0, 0, 0];
            e = (i = e.a[t])[0];
            var p = i[1],
                h = i[2],
                l = i[3],
                g = i[4];
            for (o = 0; o < b; o++) {
                i = e[f >>> 24] ^ p[r >> 16 & 255] ^ h[d >> 8 & 255] ^ l[255 & a] ^ n[s];
                var y = e[r >>> 24] ^ p[d >> 16 & 255] ^ h[a >> 8 & 255] ^ l[255 & f] ^ n[s + 1],
                    v = e[d >>> 24] ^ p[a >> 16 & 255] ^ h[f >> 8 & 255] ^ l[255 & r] ^ n[s + 2];
                a = e[a >>> 24] ^ p[f >> 16 & 255] ^ h[r >> 8 & 255] ^ l[255 & d] ^ n[s + 3], s += 4, f = i, r = y, d = v;
            }
            for (o = 0; 4 > o; o++) u[t ? 3 & -o : o] = g[f >>> 24] << 24 ^ g[r >> 16 & 255] << 16 ^ g[d >> 8 & 255] << 8 ^ g[255 & a] ^ n[s++], i = f, f = r, r = d, d = a, a = i;
            return u;
        }

        var c = {
            cipher: {},
            hash: {},
            keyexchange: {},
            mode: {},
            misc: {},
            codec: {},
            exception: {
                corrupt: function (e) {
                    this.toString = function () {
                        return "CORRUPT: " + this.message;
                    }, this.message = e;
                },
                invalid: function (e) {
                    this.toString = function () {
                        return "INVALID: " + this.message;
                    }, this.message = e;
                },
                bug: function (e) {
                    this.toString = function () {
                        return "BUG: " + this.message;
                    }, this.message = e;
                },
                notReady: function (e) {
                    this.toString = function () {
                        return "NOT READY: " + this.message;
                    }, this.message = e;
                }
            }
        };
        c.cipher.aes = function (e) {
            if (!this.a[0][0][0]) {
                var a,
                    t,
                    n,
                    f,
                    r = this.a[0],
                    d = this.a[1],
                    i = r[4],
                    o = d[4],
                    b = [],
                    s = [];
                for (a = 0; 256 > a; a++) s[(b[a] = a << 1 ^ 283 * (a >> 7)) ^ a] = a;
                for (t = n = 0; !i[t]; t ^= f || 1, n = s[n] || 1) {
                    var u = (u = n ^ n << 1 ^ n << 2 ^ n << 3 ^ n << 4) >> 8 ^ 255 & u ^ 99;
                    i[t] = u, o[u] = t;
                    var p = 16843009 * b[a = b[f = b[t]]] ^ 65537 * a ^ 257 * f ^ 16843008 * t,
                        h = 257 * b[u] ^ 16843008 * u;
                    for (a = 0; 4 > a; a++) r[a][t] = h = h << 24 ^ h >>> 8, d[a][u] = p = p << 24 ^ p >>> 8;
                }
                for (a = 0; 5 > a; a++) r[a] = r[a].slice(0), d[a] = d[a].slice(0);
            }
            if (r = this.a[0][4], d = this.a[1], b = 1, 4 !== (n = e.length) && 6 !== n && 8 !== n) throw new c.exception.invalid("10");
            for (this.g = [o = e.slice(0), t = []], e = n; e < 4 * n + 28; e++) i = o[e - 1], (0 == e % n || 8 === n && 4 == e % n) && (i = r[i >>> 24] << 24 ^ r[i >> 16 & 255] << 16 ^ r[i >> 8 & 255] << 8 ^ r[255 & i], 0 == e % n && (i = i << 8 ^ i >>> 24 ^ b << 24, b = b << 1 ^ 283 * (b >> 7))), o[e] = o[e - n] ^ i;
            for (n = 0; e; n++, e--) i = o[3 & n ? e : e - 4], t[n] = 4 >= e || 4 > n ? i : d[0][r[i >>> 24]] ^ d[1][r[i >> 16 & 255]] ^ d[2][r[i >> 8 & 255]] ^ d[3][r[255 & i]];
        }, c.cipher.aes.prototype = {
            encrypt: function (e) {
                return a(this, e, 0);
            },
            decrypt: function (e) {
                return a(this, e, 1);
            },
            a: [[[], [], [], [], []], [[], [], [], [], []]]
        }, c.bitArray = {
            bitSlice: function (e, a, t) {
                return e = c.bitArray.c(e.slice(a / 32), 32 - (31 & a)).slice(1), void 0 === t ? e : c.bitArray.clamp(e, t - a);
            },
            extract: function (e, a, c) {
                var t = Math.floor(-a - c & 31);
                return (-32 & (a + c - 1 ^ a) ? e[a / 32 | 0] << 32 - t ^ e[a / 32 + 1 | 0] >>> t : e[a / 32 | 0] >>> t) & (1 << c) - 1;
            },
            concat: function (e, a) {
                if (0 === e.length || 0 === a.length) return e.concat(a);
                var t = e[e.length - 1],
                    n = c.bitArray.getPartial(t);
                return 32 === n ? e.concat(a) : c.bitArray.c(a, n, 0 | t, e.slice(0, e.length - 1));
            },
            bitLength: function (e) {
                var a = e.length;
                return 0 === a ? 0 : 32 * (a - 1) + c.bitArray.getPartial(e[a - 1]);
            },
            clamp: function (e, a) {
                if (32 * e.length < a) return e;
                var t = (e = e.slice(0, Math.ceil(a / 32))).length;
                return a &= 31, 0 < t && a && (e[t - 1] = c.bitArray.partial(a, e[t - 1] & 2147483648 >> a - 1, 1)), e;
            },
            partial: function (e, a, c) {
                return 32 === e ? a : (c ? 0 | a : a << 32 - e) + 1099511627776 * e;
            },
            getPartial: function (e) {
                return Math.round(e / 1099511627776) || 32;
            },
            equal: function (e, a) {
                if (c.bitArray.bitLength(e) !== c.bitArray.bitLength(a)) return !1;
                var t,
                    n = 0;
                for (t = 0; t < e.length; t++) n |= e[t] ^ a[t];
                return 0 === n;
            },
            c: function (e, a, t, n) {
                var f;
                for (void 0 === n && (n = []); 32 <= a; a -= 32) n.push(t), t = 0;
                if (0 === a) return n.concat(e);
                for (f = 0; f < e.length; f++) n.push(t | e[f] >>> a), t = e[f] << 32 - a;
                return f = e.length ? e[e.length - 1] : 0, e = c.bitArray.getPartial(f), n.push(c.bitArray.partial(a + e & 31, 32 < a + e ? t : n.pop(), 1)), n;
            },
            f: function (e, a) {
                return [e[0] ^ a[0], e[1] ^ a[1], e[2] ^ a[2], e[3] ^ a[3]];
            },
            byteswapM: function (e) {
                var a;
                for (a = 0; a < e.length; ++a) {
                    var c = e[a];
                    e[a] = c >>> 24 | c >>> 8 & 65280 | (65280 & c) << 8 | c << 24;
                }
                return e;
            }
        }, c.codec.utf8String = {
            fromBits: function (e) {
                var a,
                    t,
                    n = "",
                    f = c.bitArray.bitLength(e);
                for (a = 0; a < f / 8; a++) 0 == (3 & a) && (t = e[a / 4]), n += String.fromCharCode(t >>> 8 >>> 8 >>> 8), t <<= 8;
                return decodeURIComponent(escape(n));
            },
            toBits: function (e) {
                e = unescape(encodeURIComponent(e));
                var a,
                    t = [],
                    n = 0;
                for (a = 0; a < e.length; a++) n = n << 8 | e.charCodeAt(a), 3 == (3 & a) && (t.push(n), n = 0);
                return 3 & a && t.push(c.bitArray.partial(8 * (3 & a), n)), t;
            }
        }, c.codec.base64 = {
            b: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
            fromBits: function (e, a, t) {
                var n = "",
                    f = 0,
                    r = c.codec.base64.b,
                    d = 0,
                    i = c.bitArray.bitLength(e);
                for (t && (r = r.substr(0, 62) + "-_"), t = 0; 6 * n.length < i;) n += r.charAt((d ^ e[t] >>> f) >>> 26), 6 > f ? (d = e[t] << 6 - f, f += 26, t++) : (d <<= 6, f -= 6);
                for (; 3 & n.length && !a;) n += "=";
                return n;
            },
            toBits: function (e, a) {
                e = e.replace(/\s|=/g, "");
                var t,
                    n = [],
                    f = 0,
                    r = c.codec.base64.b,
                    d = 0;
                for (a && (r = r.substr(0, 62) + "-_"), a = 0; a < e.length; a++) {
                    if (0 > (t = r.indexOf(e.charAt(a)))) throw new c.exception.invalid("12");
                    26 < f ? (f -= 26, n.push(d ^ t >>> f), d = t << 32 - f) : d ^= t << 32 - (f += 6);
                }
                return 56 & f && n.push(c.bitArray.partial(56 & f, d, 1)), n;
            }
        }, c.codec.base64url = {
            fromBits: function (e) {
                return c.codec.base64.fromBits(e, 1, 1);
            },
            toBits: function (e) {
                return c.codec.base64.toBits(e, 1);
            }
        }, c.codec.bytes = {
            fromBits: function (e) {
                var a,
                    t,
                    n = [],
                    f = c.bitArray.bitLength(e);
                for (a = 0; a < f / 8; a++) 0 == (3 & a) && (t = e[a / 4]), n.push(t >>> 24), t <<= 8;
                return n;
            },
            toBits: function (e) {
                var a,
                    t = [],
                    n = 0;
                for (a = 0; a < e.length; a++) n = n << 8 | e[a], 3 == (3 & a) && (t.push(n), n = 0);
                return 3 & a && t.push(c.bitArray.partial(8 * (3 & a), n)), t;
            }
        };
        c.mode.cbc = {
            name: "cbc",
            encrypt: function (e, a, t, n) {
                if (n && n.length) throw new c.exception.invalid("1");
                if (128 !== c.bitArray.bitLength(t)) throw new c.exception.invalid("2");
                var f = c.bitArray,
                    r = f.f,
                    d = f.bitLength(a),
                    i = 0,
                    o = [];
                if (7 & d) throw new c.exception.invalid("3");
                for (n = 0; i + 128 <= d; n += 4, i += 128) t = e.encrypt(r(t, a.slice(n, n + 4))), o.splice(n, 0, t[0], t[1], t[2], t[3]);
                return d = 16843009 * (16 - (d >> 3 & 15)), t = e.encrypt(r(t, f.concat(a, [d, d, d, d]).slice(n, n + 4))), o.splice(n, 0, t[0], t[1], t[2], t[3]), o;
            },
            decrypt: function (e, a, t, n) {
                if (n && n.length) throw new c.exception.invalid("4");
                if (128 !== c.bitArray.bitLength(t)) throw new c.exception.invalid("5");
                if (127 & c.bitArray.bitLength(a) || !a.length) throw new c.exception.corrupt("6");
                var f = c.bitArray,
                    r = f.f,
                    d = [];
                for (n = 0; n < a.length; n += 4) {
                    var i = a.slice(n, n + 4);
                    t = r(t, e.decrypt(i)), d.splice(n, 0, t[0], t[1], t[2], t[3]), t = i;
                }
                if (0 == (i = 255 & d[n - 1]) || 16 < i) throw new c.exception.corrupt("7");
                if (t = 16843009 * i, !f.equal(f.bitSlice([t, t, t, t], 0, 8 * i), f.bitSlice(d, 32 * d.length - 8 * i, 32 * d.length))) throw new c.exception.corrupt("9");
                return f.bitSlice(d, 0, 32 * d.length - 8 * i);
            }
        },
        e.exports && (e.exports = c);
    })


    a = [6, 28, 9, 0, 7, 1, 5, 36, 7, 48, 37, 0, 3, 4, 7, 38, 12, 32, 0, 0, 17, 37, 11, 2, 7, 39, 26, 35, 19, 7, 20, 25, 28, 9, 0, 11, 1, 5, 36, 7, 25, 8, 9, 6, 26, 21, 16, 45, 1, 5, 7, 0, 16383, 24, 7, 30, 23, 53, 44, 12, 0, 10, 12, 0, 2, 25, 0, 11, 3, 30, 12, 7, 24, 5, 22, 15, 13, 12, 0, 16, 31, 6, 4, 15, 27, 21, 15, 17, 15, 8, 23, 28, 7, 22, 37, 2, 0, 39, 2, 0, 23, 9, 2, 256, 7, 3, 40, 9, 6, 3, 4, 3, 42, 2, 0, 18, 3, 9, 2, 256, 7, 3, 33, 29, 3, 4, 3, 32, 31, 34, 19, 14, 17, 13, 26, 0, 5, 0, 1, 23, 6, 7, 0, 293, 12, 20, 25, 3, 23, 4, 3, 3, 2, 6, 7, 0, 471, 12, 20, 25, 3, 2, 4, 3, 6, 7, 0, 735, 12, 20, 25, 3, 2, 6, 7, 0, 471, 12, 20, 25, 3, 2, 4, 3, 17, 16, 0, 1e4, 36, 3, 37, 3, 31, 21, 16, 8, 53, 28, 3, 1], c = "dfb0bdb5babcab 22574c4647444b4c4746 66031e1609141215 187e6d767b6c717776 c6a7aba2 7117181f161403 d6b7b5b5 4a262f242d3e22 06676565 8efde6e7e8fa 1c7d7f7f 79090c0a11 61150e2708190405 f3879cb59a8b9697 f0849fb699889594 4a2d333825 3559505b52415d c6a1bfb4a9 8cffe4e5eaf8 8becf2f9e4 a2d2d7d1ca d1a5be97b8a9b4b5 32465d745b4a5756 790d163f10011c1d bad9dbd4f3efc9df 5f383a2b0f2d36293e3c260c3a2b2b363138 e4838190b4968d9285879db78190908d8a83 d3bdb6b6b792a6a7bbbca1baa9b2a7babcbd f4979b9a929d93 7b0f020b1e d2bbbcb6b7aa9db4 bfd6d1dbdac7f0d9 fd9493999885b29b f990979d9c81b69f b2d3d6d6f7c0c0ddc0 afdcdbcedddbedc6c0fccac1dcc0dd 16757978707f71 9afeefe8fbeef3f5f4 c1a3a8aea2aea5a4 36425943555e 661214070f0a a7cbc2c9c0d3cf 5c2833293f34 a3d0d7c2d1d7 fc9099929b8894 770403160503 bfcbd0cadcd7 dcafa8bdaea8 fc999298 ed9982988e85 deaaacbfb7b2 83f7ecf6e0eb c5b1b7a4aca9 fb979e959c8f93 60141201090c 2c5843594f44 176365767e7b 384c4a595154 d3b6bdb7 23574c56404b d5a6a1b4a7a1 17637862747f cdb9bfaca4a1 01626e6f676866 e89e8984818c 85e6e9ece6ee c6aaa3a8a1b2ae 02616d6c646b65 016c60795e626d68626a c9aaa5a0aaa2 c6b6b3b5ae 8ffffafce7 96faf3f8f1e2fe cfbca7a6a9bb 96f2f0e6fff2 147072647d70 0f6e7f7f666b c2a3b2b2aba6 623d100312160d10 0e60615d6b607d617c 355b5a66505b465a47 d8b9a8a8b1bc 660200160f02 e38c8da29393ab8a8786 254a4b6455556d4c4140 83e2f3f3eae7 4171707372757477767978202322252427 03707661707771 6e080201011c 2a584b444e4547 f5c5c4c7c6c1c0c3c2cdcc949796919093 84f7f1e6f7f0f6 3f55505651 d0e5e5 8beceeffd8f2f8ffeee6c2e5ede4 acdec9dfc3c0d9d8c5c3c2 c3b0b7b1aaada4aaa5ba b8cbdbcaddddd6efd1dcccd0 3c4f5f4e5959527459555b5448 f3839f9287959c819e dfabb093b0a8baad9cbeacba 0b6a656f7964626f 51383e22 9efafbe8eaf1f1f2ed 384f51565c574f4b 65080406 0d6265627e 177e7973726f5871 d0a0b9b4 65150c01 edc8d8af828f87888e99c8dfdda28f87888e99c8d8a9 ea898b8686 81f5f8f1e4 bcc8d3c9dfd4d9cf c5acaba1a0bd8aa3 1a6e7b687d7f6e 325b5c56574a7d54 59303d 7417181d111a002c 87e4ebeee2e9f3de fc9a938e9f99 543d3a30312c1b32 0b787f6a797f 295d5b484045 0b6e656f e1828e8f878886 aec9dcc1dbdefac7c3cb 94e0fbe1f7fc 7c080e1d1510 ee828b80899a86 20434f4e464947 264b475e795254474f4a 44302b31272c aaded8cbc3c6 334346405b 82f6edf7e1ea 8cfff8edfef8 ef8a8199 c3b3b1aca7 d8aebdaa 497b677b677a 89f9fbe6ed 9df8f3eb 27514255 24455454 88eceef8e1ec c8aea1a4adbca1a5ad ec8a9c9a cea2a1adafa2a7aa 0c7f757f786961 5c283531392f283d312c 26435e52 b5c6d0c6c6dcdadbfcd1 1b7a78787e777e6974767e6f7e69 b5d4d9d7c0d8f4c0c1dddac7dccfd0d1 a1e3c0d5d5c4d3d8e8cfc7ce 61030015150413182d0417040d c183a4a0a2aeafb2 caa8afa4a9a2a7abb8a186afbcafa6 492b253c2c3d26263d210c27282b252c2d 771505161913 5a3828333d322e343f2929 bedddfd3dbccdfffcbcad6d1ccd7c4dbda 13707c7e63726060 264243504f454369544f43485247524f4948 aecacbd8c7cdcbfec7d6cbc2fccfdac7c1 1f7a717e7d737a5b7a7d6a78 c5a0b7b788b6a2 c2a4adacb691abb8a791a7b6b6abaca5 0f636e61687a6e686a 7c301d09121f14330c081513120f2f05121f 96faf9f5f7e2fff9f8d7e3e2fef9e4ffecf3f2 aec2c1cdcfdac7c1c0ebc0cfccc2cbca 0e62616d6f7a6761605c6b6a7b6d6b6a4f6d6d7b7c6f6d77 04696d67766b746c6b6a614571706c6b766d7e6160 0c6163686960 c7a9a2b3b0a8b5ac93beb7a2 d2bcbda6bbb4bbb1b3a6bbbdbc93beb7a0a693a7a6babda0bba8b7b6 dab4b5aeb3bcb3b9bbaeb3b5b49bafaeb2b5a8b3a0bfbe d2bcbda6bbb4bbb1b3a6bbbdbc90b3b6b5b793a7a6babda0bba8b7b6 90feffe4f9f6f9f3f1e4f9fffec3ffe5fef4d1e5e4f8ffe2f9eaf5f4 a1d1c8d9c4cdf3c0d5c8ce c0b0aca1b4a6afb2ad 691a080f0c281b0c08 f6859584939398be939f919e82 6417071601010a300b14 6e1d0d1c0b0b0039070a1a06 a6f5e2edf0c3d4d5cfc9c8 87f4f3e6f3f2f4c5e6f5cfe2eee0eff3 4033393334252d 55233027263c3a3b 15627c737c507b7477797071 6e3907080727000801 7c0b151218130b3419151b1408 02756b6c666d75556b66766a 93e0f0e1f6f6fdc1f6f0fce1f7 026b7152706b7463617b 6109001232181215040c31130e1918 32515342464740576057515d4056 1e7b6c6c536d79 94fde7d7fcf5e6f3fdfaf3 cba7aebdaea7 d3bfb6b5a7 1b69727c736f 14607b64 98faf7ececf7f5 80f7e9e4f4e8 0c6469656b6478 4714140e03 f2b0a1a1bbb6 751400011a3f1a1c1b1011 0d7e646a636c615e797f68636a7965 3359464047795c5a5d5657 f5869096808790 701602150105151e1309 7d0e090f14131a141b04 a2c6cdccc7 b6c0d7dac3d3 98d4f9edf6fbf0d7e8ecf1f7f6ebcbe1f6fb deaebfacadbb e49790968d8a838d829d b5c5d4c1dd 84f7e7e1eae1 ee8f8d8d8b828b9c81838b9a8b9c 8de4feccffffecf4 610d040f061509 71151e1f14 6016010c1505 afdfdadcc7 1052716464756269597e767f 4b1c222d2202252d24 057664636044776064 4b383f3922252c 6919081b1a0c 6d020f07080e19 037376706b 7c0c090f14 4d090b1d 56332e2639242225 395c4149564b4d4a 16747361776473 b6dad3d8d1c2de 2556494c4640 0a796663696f c2b1aeaba1a7 4079710502017604020574057501770378057605730173037106740174040606790579 5d1e681b681b191b681b6f1b681b6e1b681b6d1b681b6c1b681b6b1b681b6a1b681b69 f9959c979e8d91 a3cfc6cdc4d7cb 25155d 9be8eef9e8efe9 093971 e88b80899aa99c 56353e37241722 adcbdfc2c0eec5ccdfeec2c9c8 265653554e f498919a93809c f5969a919096 2055544618735452494e47 f68299b49f8285 d3b0bcb7b6b0 a5d0d1c39df6d1d7cccbc2 1d69725f74696e 1f7c766f777a6d 3c5d594f b2dfddd6d7 6a090809 badedfd9c8c3cace 83e0ece7e6e0 3f4a4b59076c4b4d565158 deb8acb1b39cb7aaad 91fcfef5f4 bedddcdd 10757e7362696064 0a69656e6f69 2b494a584e1d1f 0167736e6c43687572 cdbdbfa2a9 3058444440431503711502761502765d43401e5d55594445515e1e535f5d 9aeeffe9ee d1b9a5a5a1a2f4e290f4e397f4e397b0a1a1a2b4b2fcbcbeb3b8bdb4ffa2b4b2ffa5b4a2a5ffa2b0bfbaa4b0b8ffb2bebc 8beee5fd 4e3e3c212a 660507050e032d031f 390d095808095d5c0b 69191b060d 65000b13 0575776a61 5e2a3b2d2a 3c4f454f485951 5b3d2b2d 192b372b372a 54030c0b0b223126657a667a640b171717170b f29c9d85 8fe3eae1e8fbe7 26454e4754654942436752 83e0ebe2f1c0ece7e6c2f7 2f495d40426c474e5d6c404b4a fc8e9d92989391 fc9193989990 a5d6dcd6d1c0c8 224f4d46474e 1063696364757d 35464c46415058 e195888c849295808c91 f98d90949c8a8d989489 dfb0afbab1b6bb bed1cedbd0d7da 2c414819 a7d4d3d5f3c8f29f 41323533282f26282738 c5a6aaaba6a4b1 13606761 1d69724e696f74737a 5a293633393f cfaba9bf86ab e99d80848c9a9d888499 74181b1715183d10 8befedfbc2ef 02716770746770566b6f67466b6464 4a232e 076361774e63 274b4844464b6e43 3e4a57535b4d4a5f534e eb828f 513835 f8919c cdbea8bfbba8bf99a4a0a889a4abab fa939e 26554354504354724f4b43624f4040 6c0b09182a0500093f151f180901210d020d0b091e bac9cedbcee9c3d4d9 88ede6fe 27727462757863667366787766736f 325e5341467351515741415756665b5f57 e08c819394ad8f848986898584b4898d85 2944464d4c e3908a9986 dfafadb0abb0aba6afba 2c4f4d4040 84f4f1f7ec f9899689 3a565f545d4e52 86eae3e8e1f2ee 4428212a23302c c8b8bdbba0 3458515a53405c 6509000b02110d 066a636861726e 5b373e353c2f33 38545d565f4c50 d9b5bcb7beadb1 234f464d44574b 98e8edebf0 7f131a11180b17 adc1c8c3cad9c5 f8949d969f8c90 f19d949f968599 93f5e0fefcf7f6 6d0c1d1d 59382929103d 1f706f7a71767b bcd3ccd9d2f5d8 d0a5beb9bfbeb9b4 bbced5d2d4d5f2df 503d33383934 066b656e4f62 f2959786b49b9c959780a1979c819d80 6a1913191e0f07 f695999b86978585 6e0d0103 f5868c86819098 7e1f1d1d1b121b0c11131b0a1b0c c4a5a7a7 592a202a2d3c34 66011f1409 412638332e b4c7cdc7c0d1d9 bbd8dacbcfcec9dee9ded8d4c9df 4a393e3823242d232c33 62111b1116070f bedbc6d7cdcae9d3ced8 12677c7677747b7c7776 a7d4ded4d3c2ca 325f5d465b5d5c 1d707269 4a3933393e2f27 c6a5aaafa5ad 77101203311e19101205341b1e141c 1e7a786e777a e6828096af82 167a7975777a7f72 660a0905070a2f02 53353a3f36273a3e36 f084999d958384919d80 8aebeeeecff8f8e5f8 91f6f4e5d7f8fff6f4e3a3 3d4e495c4f496a545b54 791e1c0d3a1617171c1a0d1c1d2e101f10 5122282225343c d88fb1beb191b6beb7 6b181f1902050c020d12 4f38262926 95e2fcf3fcd9fce6e1 8beae5eff9e4e2ef e192989295848c 5c2c303d283a332e31 4c2b29381b252a2500253f38 d6b9b891b3a281bfb0bf9abfa5a2 a9dad0daddccc4 b0c7d9d6d9fcd9c3c4 f48780869d9a939d928d 26514f404f6a4f5552 6609082716162e0f0203 5639381726261e3f3233 bbd8dad8d3def0dec2 2f484a5b695a4343764a4e5d 533436271e3c3d273b 2146445565405544 620507162a0d171011 2e494b5a6347405b5a4b5d 254240517640464a4b4156 721c1d05 eb81988cbd8e9998828485 53617d617d60 bdd9dcc9dc e4819c90 9dfbeef0f2f9f8 d8abacb9bbb3 99faf6f7faf8ed 365559525355 8ffafbe9b7dcfbfde6e1e8 5f2b301d362b2c 2d5e595f44434a444b54 1e746d7a786e487b6c6d777170 34061a061a07 cebaa7a3ab 0d627e 5d283339383b34333839 3b56564b 770012141f1603 dba9beaaaebea8af 8faabdc9f9beaabdc9f8f7ebe9ffe6eb da8a95898e 204150504c49434154494f4e0512664a534f4e ec9e899c839e98b8858f87 d1a2a5b0a5a4a292beb5b4 482c293c29 ec888d988d 197d7f69 09677c646b6c7b 7511140114 b1d8dfc5d4c3c7d0dd f591948194 285b4d5a5e4d5a7c41454d5b5c494558 c6a8b3aba4a3b4 95f1f4e1f4 2e5d4b5c584b5c7a47434b5d5a4f435e 1d797c697c 394a5c4b4f5c4b6d50545c4a4d585449 b8d6d7cf 472321370e23 83e7e2f7e2 cda9abbd 2f5c4a5d594a5d7b46424a6b464949 5f3a272f362d3e2b3630310b36323a 8eeaeffaef 660f0812031410070a 543a3b23 88ece9fce9 fc989a8c f1989f988598909d988b94 7c090c181d08193f13121a151b c7a3a6b3a6 d4b0b2a4 7415101035041d 137775634c7775637a77 3a54554d 6400051005 f99d988d98 a2c6c3d6c3 9efdf1fafb 92f6f3e6f3 6d0e020908 c4b3ada2ad88adb7b0 5f3e3b3b1e2f36 016567715e736470 ddaea9bca9a8ae9eb2b9b8 7c12130b f4959090b5849d 640002143b1601153b08010a03100c c8bbbcbaa1a6afa1aeb1 1c7079727b6874 5d382f2f3332 b2d7c0c0dcdd a9c8cdcde8d9c0 d0b4b6a08fa2b5a1 9ef0f1e9 d3b2b7b796a1a1bca1 3753586552475845437147 e7868383a6978e 9efaf8eec1ecfbef 5937362e 86e7e2e2c7f6ef 7a1e1c0a25081f0b a2c6c4d2f0c7d2cdd0d6c7c6 cca5a8 7d18050d140f1c0914121329141018 fe889f928b9bb198 67021f170e1506130e0809330e0a02 c7a3a1b795a2b7a8b5b3a2a3 533220203a343d 394b5c49564b4d6d505a52 fd8e848e89989094939b92 3156544562484245545c785f575e 394a404a4d5c54 49272c3d3e263b2220272f26 147371605a7160637b667f406d6471 630d0617140c1108371a1306 2d4f5f444a455943485e5e bcdbd9c8efdfced9d9d2feced5dbd4c8d2d9cfcf debcacb7b9b6aab0bbadad 5a292e35283b3d3f33343c35 583f3d2c0b2c372a393f3d11363e37 96c5e2f9e4f7f1f3dff8f0f9 9af8fffbf9f5f4e9 fc9b9988be999d9f93928f 3775525654585944 d3a0b6bfb6b0a7b6b7a7b6aba7a1b2bdb4b6 b6d1d3c2e5d3dad3d5c2d3d2e2d3cec2e4d7d8d1d3 94c7f1f8f1f7e0f1f0c0f1ece0c6f5faf3f1 9cf0fde9f2fff4f3ece8f5f3f2efefe5f2ff 244341506845514a474c6b54504d4b4a57775d4a47 92def3e7fcf1fadde2e6fbfdfce1c1ebfcf1 f29093868697808b9b9c949d 3a5d5f4e785b4e4e5f484373545c55 266447525243545f6f484049 91e2f2e3f4f4ffc3f4f2fee3f5f8fff6c2e5f0e5f4 c8afadbc9babbaadada69aadaba7baaca1a6af9bbca9bcad 3f4c5c4d5a5a516d5a5c504d5b5651586c4b5e4b5a 96faf9f5f7faffe6 5a3d3f2e1635393b36130a1b3e3e283f2929 412d2e22202d2831 433336302b 32475c5657545b5c5756 a7d7d2d4cf deb0abb2b2 147b767e717760 7e0e0b0d16 5b282f2932353c323d22 4a3a3f3922 e1878e93a4808289 b0c0c5c3d8 5a292a36332e 98f4fdf6ffecf0 691a1905001d 076b626960736f dcaeb9acb0bdbfb9 88e4ede6effce0 2151545249 cdb8a3a9a8aba4a3a8a9 443431372c 215344514d404244 afccc7ceddeedb bad9d2dbc8fbce 197a71786b586d 9fefeaecf7 cebebbbda6 0d6e656c7f4e6269684c79 a6cac3c8c1d2ce 394a55505a5c 66050e07142712 f3909b9281b287 4d3d383e25 533e3223 513b3e383f 9fedfaeff3fefcfa 1c392e292e2d 0b796e7b676a686e 8eabbcbbbcb9 acdec9dcc0cdcfc9 a08592959298 3c4e594c505d5f59 37120502050e 6a4f585f582b 5d2d282e35 b7ddd8ded9 f09180809c99939184999f9ed5c2b688dd878787dd969f829ddd85829c959e939f949594 157e706c66 28444d464f5c40 dbb8b4b5afbeb5aff6afa2abbe 5c283310332b392e1f3d2f39 681c0724071f0d1a2b091b0d 92e1e6f3e0e6e1c5fbe6fa 91e2f8f6 82e3e6e6c3f2eb b1d5d7c1eec2d8d6df a3cdccd4 0e7b606a6b6867606b6a b0c7d5d2 dda8b3b9b8bbb4b3b8b9 016c7552646274736875785268666f 74190027111701061d000d271d0115 62005a d9b1bcb8bdbcab 630e06170b0c07 3d7a7869 23574c765353465160425046 85c2c0d1 adeae8f9 8afcebe6ffefc5ec 6b0d02050c0e19 f2818696 6b1e1907 afcbcedbce f1999490959483 c9a6aba3acaabd f49c9195909186 a9c1ccc8cdccdb 43263b2620 7b3c3e2f b7d8d5ddd2d4c3 4f242a363c e38f868d84978b 533f363d34273b fc9a938eb99d9f94 b0d8d1c3ffc7dee0c2dfc0d5c2c4c9 364542445f5851 a5cac7cfc0c6d1 91e1e4e2f9 e5838a97a084868d 6e1e1b1d06 5832373136 4b282425282a3f b1c2dec3c5 a8cec7daedc9cbc0 4e3e3b3d26 1c76737572 c0878594 cfbcbbbda6a1a8 3a4a4f4952 b7d6c7c7dbce b6d7c6c6dacf 750601071c1b121c130c 5a363f343d2e32 9bebeee8f3 eb8a9b9b8792 87f2e9e3e2e1eee9e2e3 c9a5aca7aebda1 29454c474e5d41 f1839e848594 234111 3f555d 7f081c 671704 cdbab5 e88d869e 85e0ebf3 37505243784059674558475245434e73524454455e47435845 026567764361616d776c764b6c646d517b6c61 0c7b7e65786d6e6069 a5d0cbc1c0c3cccbc0c1 482d3e2924 dfacabbebcb4 3c4f485d5f57 2e47404d425b4a4b5d 6b0a1b1b46180e191d02080e fb888f9a9890 0c65626f607968697f 9cfdececeff9eeeaf5fff9 4e3a211d3a3c272029 0b626568677e6f6e78 daffef98b4bbaeb3acbfffe8eab9b5bebfffef9e 2b4149 92e5f1 89feea d1a6b2 b2d6d7d0c7d5 84f4e7 d3a5b6a1a0babcbda0 017162 f4829186879d9b9a87 0b65646f6e ee9996 442321300b332a14362b342136303d00213727362d34302b36 1e6a714d6a6c777079 d2bbbcb1bea7b6b7a1 eecbdbac808f9a87988bcbdcde8d818a8bcbdbaa 82e7ecf4 fe9d91909d9f8a d0a3a5b2a3a4a2b9beb7 f48481879c 0f6e7f7f6376 1161646279 a6c7d6d6cadf e589808b82918d c7b7b2b4af 81a4b2c5a4b2c5 fb8b8e8893 2842474146 e3808c8d808297 2b474e454c5f43 29595c5a41 3a59525b4879555e5f7b4e c9babdbba0a7aea0afb0 2a474e1f7e45624f52 8deee2e3eeecf9 aecdc1c0cdcfda f697c7 e687d4 2a4b19 9ef8f7f0f9fbec d3b2e7 204115 c8a9fe 4b2a7c 9ce4ac 234212 bedf8c 573664 254411 026335 98f5fcadd9eaeaf9e1 275f17 e991d9 711540 402d2475142f082538 e6878282a394948994 bedddfd2ddd3cad9cdd7d9 8ffcfbfde6e1e8e6e9f6 026a6763666770 78150c1f0b111f 1a7f6e ea84859d 7d14131409141c11140718 3c5d5858684e5d5f57 3f5e0d b4d085 315d545f564559 b8d9dcdcf9c8d1 056163755a766c626b5a69606b62716d d2beb7bcb5a6ba c2a3a6a683b2ab b8dcdec8e7cbd1dfd6 3957564e 751411113007071a07 3a495b5c5f69535d546d534e5269534f5b 2746434366574e 82e6e4f2ddf1ebe5ec 0c62637b f587908480908681 5f2c2b2d363138 660a030801120e 84e7ece5f6c7ebe0e1c5f0 afc3cac1c8dbc7 c7aba2a9a0b3af 4e202139 f9929c808a b4d683 e88e8487879a 630d0c14 3b48525c55 44372d232a132d302c172d3125 97e5f2e6e2f2e4e3 c0b2a5b1b5a5b3b497a9b4a893a9b5a1 cea8a7a0a9abbc ccaaa5a2aba9be 6805110f1d091a0c d4b3b1a095b7b7bba1baa09dbab2bb87adbab7 305755447153535f455e44795e565f63495e53 8be9ba 660b0f080f3614090114070b bdd0d4d3d4edcfd2dacfdcd0 a4c5d4d4edc0 1177787f767463 f5989c9b9ca5879a92879498 335243437a57 4924202720193b262e3b2824 81e0f1f1c8e5 f49584849d90 e5838c8b828097 dbbaababb2bf abcadbdbc2cf 3956495c57505d 325004 355a45505b5c51 d6b0bfb8b1b3a4 c8a7b8ada6a1ac 64110a0d0b0a0d00 b7d1ded9d0d2c5 b5c0dbdcdadbdcd1 7f121c17161b 3b5d52555c5e49 f09d93989994 295c5a4c5b40474f46 6107080f060413 ed9e98 80f5f3e5f2e9eee6ef 04777d777061696d6a626b 15666c666170787c7b737a fd9398898a928f9694939b92 066863727169746d4f686069 89ebfbe0eee1fde7ecfafa 0d6f7f646a657963687e7e 8be9eaffffeef9f2e2e5ede4 2f5c5b405d4e484a46414940 4112352e33202624082f272e 0b696e6a68646578 8ac8efebe9e5e4f9 1e6d7b727b7d6a7b7a6a7b666a6c7f70797b 2172444d44425544457544595573404f4644 bcd0ddc9d2dfd4d3ccc8d5d3d2cfcfc5d2df fcb09d89929f94b38c889593928faf85929f ed9a848b8484838b82 e0b7898689a98e868f d7a0beb1be9bbea4a3 cbbca2ada287a2b8bf abc0ced2d8 5e38312c1b3f3d36 5036393e373522 156671 cea9abba9dbaa1bcafa9ab9db7a0ad 487d787a2a782c2d7e ee9e8f9c9d8b f59385 3a5c57 f096999e979582 73000715 127462 bddbd0 5137383f363423 e7889782898e83 24574150764554504b56674b4a424d43 600f170c 234a4d4a57604257 f39c849f 6f090601080a1d 543b2338 7a150d16 2445404065544d6b464e 98f9fcfcd9e8f1d7faf2 ec8d8888a99e9e839ea38e86 325356567740405d407d5058 b2d5d7c6e1d7c1c1dbdddcfbd6 a8cec1c6cfcdda a9dada 7417181d171f200615171f c2a6a4b2aba6 08697878616c b4ebc6d5c4c0dbc6 c1afae92a4afb2aeb3 0a6465596f64796578 84edeaedf0d7e1eaf7ebf6 3056595e575542 5032393f 94f2fdfaf3f1e6 ec9f9899 1c7572756851514c54736e72 c3adacb4 f1969882 74121d1a131106 1d716e7e aecbda 5c3d38381d2c35 9affeec5e9f6 e58b8a92 781116110c11191411021d 5e2b2e3a3f2a3b1d3130383739 e98087838c8a9dbb88999d869b 5a3334303f392e1928396968 c5a3acaba2a0b7 294047405d40484540534c 234a4d49464057604c4e534f465746 c0a1a4a481b0a9 d5b0a18abcbbbca1 335d5c44 d9b8bdbd98a9b0 3f5b594f605651564b ec82839b 87e9e8f0 2a4c43444d4f58 59383d3d182930 94f0f2e4cbe7fde1f5 a8c6c7df d5b4b1b194a5bc 3753514768445e4256685b525950435f 0a666f646d7e62 deb9bbaa92b1bdbfaab7b1b0 0b6f6e6d62656e5b79647b6e797f72 3a5d5f4e7655595b4e535554 5427213737312727 1162647272746262 7d1e1c1111 0f696661686a7d f4958484988d 601315 ceafaaaa8fbea7 c4a0a2b49bb7adb1a5 46352f3327122f2b2334 6504010124150c f0949680af999e9984a3899e93 bdd3d2ca 56323026153a3f353d022437353d".split(" "), t = function e(a, t) {
        t = c[a -= 0], void 0 === e.xbxtOV && (e.tDjgLr = function (e) {
            for (var a = "", c = e.length, t = parseInt("0x" + e.substr(0, 2)), n = 2; n < c; n += 2) {
                var f = parseInt("0x" + e.charAt(n) + e.charAt(n + 1));
                a += String.fromCharCode(f ^ t);
            }
            return decodeURIComponent(a);
        }, e.rgCmEF = {}, e.xbxtOV = !0);
        var n = e.rgCmEF[a];
        return void 0 === n ? (void 0 === e.qiCvTI && (e.qiCvTI = !0), t = e.tDjgLr(t), e.rgCmEF[a] = t) : t = n, t;
    };

    function _typeof(o) {
        return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
                return typeof o
            }
            : function (o) {
                return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o
            }
            ,
            _typeof(o)
    }

    e = _typeof
    
    function getSessionId() {
        const hexChars = "0123456789abcdef";
        const chars = Array.from({length: 36}, () =>
            hexChars.charAt(Math.floor(Math.random() * 16))
        );
        chars[14] = "4";
        chars[19] = hexChars.charAt((parseInt(chars[19], 16) & 0x3) | 0x8);
        [8, 13, 18, 23].forEach(pos => chars[pos] = "");
        return chars.join("") + "03";
    }

    sessionId = getSessionId()

    // ---------------------------------------------------------------------------------------------------------------- //

    a = [6, 28, 9, 0, 7, 1, 5, 36, 7, 48, 37, 0, 3, 4, 7, 38, 12, 32, 0, 0, 17, 37, 11, 2, 7, 39, 26, 35, 19, 7, 20, 25, 28, 9, 0, 11, 1, 5, 36, 7, 25, 8, 9, 6, 26, 21, 16, 45, 1, 5, 7, 0, 16383, 24, 7, 30, 23, 53, 44, 12, 0, 10, 12, 0, 2, 25, 0, 11, 3, 30, 12, 7, 24, 5, 22, 15, 13, 12, 0, 16, 31, 6, 4, 15, 27, 21, 15, 17, 15, 8, 23, 28, 7, 22, 37, 2, 0, 39, 2, 0, 23, 9, 2, 256, 7, 3, 40, 9, 6, 3, 4, 3, 42, 2, 0, 18, 3, 9, 2, 256, 7, 3, 33, 29, 3, 4, 3, 32, 31, 34, 19, 14, 17, 13, 26, 0, 5, 0, 1, 23, 6, 7, 0, 293, 12, 20, 25, 3, 23, 4, 3, 3, 2, 6, 7, 0, 471, 12, 20, 25, 3, 2, 4, 3, 6, 7, 0, 735, 12, 20, 25, 3, 2, 6, 7, 0, 471, 12, 20, 25, 3, 2, 4, 3, 17, 16, 0, 10000, 36, 3, 37, 3, 31, 21, 16, 8, 53, 28, 3, 1]
    Tc = ["Z", "m", "s", "e", "r", "b", "B", "o", "H", "Q", "t", "N", "P", "+", "w", "O", "c", "z", "a", "/", "L", "p", "n", "g", "G", "8", "y", "J", "q", "4", "2", "K", "W", "Y", "j", "0", "D", "S", "f", "d", "i", "k", "x", "3", "V", "T", "1", "6", "I", "l", "U", "A", "F", "M", "9", "7", "h", "E", "C", "v", "u", "R", "X", "5"]

    // ---------------------------------------------------------------------------------------------------------------- //

    gc = {
        "system": {
            "errMsg": "getSystemInfo:ok",
            "albumAuthorized": true,
            "benchmarkLevel": -1,
            "bluetoothEnabled": false,
            "brand": "microsoft",
            "cameraAuthorized": true,
            "fontSizeSetting": 15,
            "language": "zh_CN",
            "locationAuthorized": true,
            "locationEnabled": true,
            "microphoneAuthorized": true,
            "model": "microsoft",
            "notificationAuthorized": true,
            "notificationSoundEnabled": true,
            "pixelRatio": 1,
            "platform": "windows",
            "power": 100,
            "safeArea": {
                "bottom": 780,
                "height": 780,
                "left": 0,
                "right": 414,
                "top": 0,
                "width": 414
            },
            "screenHeight": 780,
            "screenWidth": 414,
            "statusBarHeight": 20,
            "system": "Windows 11 x64",
            "theme": "light",
            "version": "4.0.5.23",
            "wifiEnabled": true,
            "windowHeight": 780,
            "windowWidth": 414,
            "SDKVersion": "3.10.3",
            "enableDebug": false,
            "host": {
                "appId": "",
                "env": "WeChat"
            },
            "appName": "weixin",
            "devicePixelRatio": 1,
            "brightness": 0.5,
            "LaunchOptionsSync": "{\"path\":\"index/pages/mt/mt\",\"query\":{},\"scene\":1256,\"referrerInfo\":{},\"apiCategory\":\"default\"}",
            "isPrivacy": 1,
            "hasSystemProxy": -1,
            "captureRecord": "[]",
            "networkType": "wifi",
            "StorageInfo": "{\"currentSize\":1028,\"errMsg\":\"getStorageInfo:ok\",\"keys\":[\"UGC_VIDEO_PLAY_OPTIMIZE_STORAGE_KEYS_IfDeviceSupportDecodeHevc\",\"HOTEL_GUIDE\",\"WXOWLKEY-unionId\",\"_lx_sdk_data\",\"openId\",\"unionId\",\"oneid_mp\",\"shangou_wx_scene\",\"shangou_LOACL_NEW_USER_COUPON_COUNT\",\"_sdkHorn_perf-mp-sdk\",\"enableAlitaForMtMini\",\"shangou_locName\",\"WEGS\",\"__MTUC__mtInfo\",\"__perf_userid\",\"uuid\",\"special_channel_station\",\"hotel_coupon_report_-1\",\"_zg_lx_uuid\",\"token\",\"locate_pop\",\"shangou_sg-loc-position\",\"shangou_yodaOrderData\",\"shangou_UUID\",\"kingkongBubble\",\"shangou_authSetting\",\"_lx_sdk_interceptData\",\"mtptTabs\",\"mtptTabsBadges\",\"mt_cityInfo\",\"502b0de6\",\"__horn_mp__::waimai_alita_config_android\",\"logan_session_token\",\"__horn_mp__::mtweapp_privacy_api\",\"__horn_mp__::mtweapp_update_manager_config\",\"40a10de2\",\"phx-userInfo\",\"bluemp_scene_wxgroup_other_homepage_personal_channel\",\"shangou_ENV\",\"__horn_mp__::mtweapp_gray\",\"bluemp_scene_wxgroup_other_business_newer\",\"bluemp_scene_wxgroup_other_homepage_personal_channel1\",\"search-word-res\",\"502b1df4\",\"shangou___sg_ab_scene_map\",\"shangou_historyLabels\",\"hotel_appEnv\",\"is_report_uv\",\"shangou_user\",\"GlobalHistoryDataKey\",\"ADDRESS_HOME_V3_CACHE\",\"mt_locCityInfo\",\"__horn_mp__::ehc_wallet_config_topspeed\",\"hotel_StarAndPrice\",\"__MTUC__wxIds\",\"mt-mine-cards\",\"hotel_gat_selectCity\",\"_mtweapp_storage_cleaned\",\"__horn_mp__::uuid_operation_config\",\"__horn_mp__::mtweapp_subscriptibe_message_switch\",\"openIdCipher\",\"index_all_storage\",\"hotel_checkTime\",\"add-to-mine-bubble\",\"__horn_mp__::mtweapp_storage_info_analysis\",\"isKingkongAni\",\"$PIKE_DEVICEID\",\"_lx_sdk_send_cache_data\",\"hotel_selectCity\",\"shangou_abtest\",\"wx-safety-request-horn\",\"__MTUC__authInfo\",\"fullKingkongBubble\",\"mt.app.$abStrategyCache\",\"__horn_mp__::mtweapp_launch_aggregate_config\",\"$PIKE_LOADBALANCE_UNDEFINED\",\"__horn_mp__::mtweapp_tab_info_api\",\"hotel_diviceInfo\",\"llog_config\",\"__horn_mp__::mtweapp_blue_config\",\"__horn_mp__::fup_prefetch_config_wx\",\"guardSample\",\"shangou_wx_set_info\"],\"limitSize\":10000}",
            "localip": "{\"errMsg\":\"getLocalIPAddress:ok\",\"localip\":\"192.168.5.23\",\"netmask\":\"255.255.255.0\"}",
            "compass": [],
            "accelerometer": [],
            "gyro": [],
            "existWmpf": 0,
            "motion": [],
            "click": [],
            "BatteryInfo": "{\"errMsg\":\"getBatteryInfo:ok\",\"isCharging\":true,\"level\":100}",
            "SelectedTextRange": "{\"errMsg\":\"getSelectedTextRange:ok\",\"start\":8,\"end\":8}"
        },
        "fpv": "2.3.1",
        "timestamp": 1764122980,
        "ext": [
            0,
            1,
            2,
            0,
            4
        ],
        "app": wxstr,
        "openid": "oJVP50DgFvhRE5jVwq-26v6F_uS4",
        "sessionId": sessionId,
        "dfpid": dfpid,
        "localid": "1760085167622IGSSMUW60e593ce0a815b08d658526270cd17d61978",
        "filetime": 1760085167622,
        "fsmode": [
            1764104930,
            1764138574,
            16822,
            0
        ],
        "reportTick": 1,
        "e": "Error\n    at f (https://usr/appservice.app.js:1933:70672)\n    at Function.<anonymous> (https://usr/appservice.app.js:1933:70254)\n    at f (https://lib/WASubContext.js:1:151799)\n    at https://lib/WASubContext.js:1:152242\n    at Function.<anonymous> (https://lib/WASubContext.js:1:115822)\n    at Function.<anonymous> (https://lib/WASubContext.js:1:147131)\n    at p (https://lib/WAServiceMainContext.js:1:158013)\n    at https://lib/WAServiceMainContext.js:1:158456\n    at https://lib/WAServiceMainContext.js:1:148161"
    }
    cc = tc = true
    fc = [0, 1, 2, 0, 4]
    nc = {
        "appId": gc['app'],
        "openId": gc['openid'],
        "unionId": gc['unionid'],
        "sessionId": sessionId
    }

    mc = function () {
        return {
            "timestamp": gc['filetime'],
            "localId": gc['localid'],
            "dfpId": gc['dfpid'],
            "serverTimeDiff": 62,
            "expirationTime": 1758876081176
        }
    }
    ic = []
    pa = {
        "DFP": ["app", "dfpid", "filetime", "fpv", "localid", "system", "timestamp", "ext", "sessionId"],
        "system": ["accelerometer", "albumAuthorized", "BatteryInfo", "batteryLevel", "Beacons", "benchmarkLevel", "bluetoothEnabled", "brand", "brightness", "cameraAuthorized", "compass", "deviceOrientation", "devicePixelRatio", "enableDebug", "errMsg", "fontSizeSetting", "language", "LaunchOptionsSync", "locationAuthorized", "locationEnabled", "locationReducedAccuracy", "microphoneAuthorized", "model", "networkType", "notificationAlertAuthorized", "notificationAuthorized", "notificationBadgeAuthorized", "notificationSoundAuthorized", "pixelRatio", "platform", "safeArea", "screenHeight", "screenTop", "screenWidth", "SDKVersion", "statusBarHeight", "system", "version", "wifiEnabled", "WifiInfo", "windowHeight", "windowWidth", "screenRecord", "isPrivacy", "hasSystemProxy", "captureRecord"],
        "BatteryInfo": ["errMsg", "isCharging", "level"],
        "safeArea": ["left", "right", "top", "bottom", "width", "height"],
        "WifiInfo": ["SSID", "BSSID", "autoJoined", "signalStrength", "justJoined", "secure", "frequency"]
    }

    Jc = 48
    Cc = {
        "b7": 1758812770,
        "b1": {
            "miniProgram": {
                "appId": gc['app'],
                "envVersion": "release",
                "version": "9.37.408"
            }
        },
        "b6": gc['openid'],
        "b8": Jc,
        "b2": "packages/search/pages/search/search"
    }

    Dc = {
        "finger": {
            "std": function std() {
                return -169
            },
            'd': function d() {
                return gc['dfpid']
            }
        }
    }

// ---------------------------------------------------------------------------------------------------------------- //
    function Y() {
        try {
            var e = Math.round(new Date().getTime() / 1e3);
            gc.timestamp = e;
        } catch (e) {
            gc.timestamp = "";
        }
    }

    function G(e, a) {
        var c = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
        if (c) return (c = c.call(e)).next.bind(c);
        if (Array.isArray(e) || (c = function (e, a) {
            if (e) {
                if ("string" == typeof e) return L(e, a);
                var c = {}.toString.call(e).slice(8, -1);
                return "Object" === c && e.constructor && (c = e.constructor.name), "Map" === c || "Set" === c ? Array.from(e) : "Arguments" === c || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c) ? L(e, a) : void 0;
            }
        }(e)) || a && e && "number" == typeof e.length) {
            c && (e = c);
            var t = 0;
            return function () {
                return t >= e.length ? {
                    done: !0
                } : {
                    done: !1,
                    value: e[t++]
                };
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    ga = Uint8Array,
        ya = Uint16Array,
        va = Uint32Array,
        ma = new ga([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]),
        wa = new ga([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]),
        _a = new ga([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
        xa = function (e, a) {
            for (var c = new ya(31), t = 0; 31 > t; ++t) c[t] = a += 1 << e[t - 1];
            for (e = new va(c[30]), t = 1; 30 > t; ++t) for (a = c[t]; a < c[t + 1]; ++a) e[a] = a - c[t] << 5 | t;
            return [c, e];
        },
        Sa = xa(ma, 2),
        ja = Sa[1];
    Sa[0][28] = 258, ja[258] = 28;
    for (var Aa = xa(wa, 0)[1], Oa = new ya(32768), Ca = 0; 32768 > Ca; ++Ca) {
        var Ia = (43690 & Ca) >>> 1 | (21845 & Ca) << 1;
        Ia = (61680 & (Ia = (52428 & Ia) >>> 2 | (13107 & Ia) << 2)) >>> 4 | (3855 & Ia) << 4, Oa[Ca] = ((65280 & Ia) >>> 8 | (255 & Ia) << 8) >>> 1;
    }
    var Da = function (e, a, c) {
            for (var t = e.length, n = 0, f = new ya(a); n < t; ++n) ++f[e[n] - 1];
            var r = new ya(a);
            for (n = 0; n < a; ++n) r[n] = r[n - 1] + f[n - 1] << 1;
            if (c) {
                for (c = new ya(1 << a), f = 15 - a, n = 0; n < t; ++n) if (e[n]) {
                    var d = n << 4 | e[n],
                        i = a - e[n],
                        o = r[e[n] - 1]++ << i;
                    for (i = o | (1 << i) - 1; o <= i; ++o) c[Oa[o] >>> f] = d;
                }
            } else for (c = new ya(t), n = 0; n < t; ++n) c[n] = Oa[r[e[n] - 1]++] >>> 15 - e[n];
            return c;
        },
        Na = new ga(288);
    for (Ca = 0; 144 > Ca; ++Ca) Na[Ca] = 8;
    for (Ca = 144; 256 > Ca; ++Ca) Na[Ca] = 9;
    for (Ca = 256; 280 > Ca; ++Ca) Na[Ca] = 7;
    for (Ca = 280; 288 > Ca; ++Ca) Na[Ca] = 8;
    var Ta = new ga(32);
    for (Ca = 0; 32 > Ca; ++Ca) Ta[Ca] = 5;
    var ka,
        Pa,
        Ja,
        Ma = Da(Na, 9, 0),
        Ra = Da(Ta, 5, 0),
        za = function (e, a, c) {
            (null == a || 0 > a) && (a = 0), (null == c || c > e.length) && (c = e.length);
            var t = new (e instanceof ya ? ya : e instanceof va ? va : ga)(c - a);
            return t.set(e.subarray(a, c)), t;
        },
        Ea = function (e, a, c) {
            c <<= 7 & a, e[a = a / 8 >> 0] |= c, e[a + 1] |= c >>> 8;
        },
        qa = function (e, a, c) {
            c <<= 7 & a, e[a = a / 8 >> 0] |= c, e[a + 1] |= c >>> 8, e[a + 2] |= c >>> 16;
        },
        Fa = function (e, a) {
            for (var c = [], t = 0; t < e.length; ++t) e[t] && c.push({
                s: t,
                f: e[t]
            });
            var n = c.length;
            if (e = c.slice(), !n) return [new ga(0), 0];
            if (1 == n) return (a = new ga(c[0].s + 1))[c[0].s] = 1, [a, 1];
            c.sort(function (e, a) {
                return e.f - a.f;
            }), c.push({
                s: -1,
                f: 25001
            }), t = c[0];
            var f = c[1],
                r = 0,
                d = 1,
                i = 2;
            for (c[0] = {
                s: -1,
                f: t.f + f.f,
                l: t,
                r: f
            }; d != n - 1;) t = c[c[r].f < c[i].f ? r++ : i++], f = c[r != d && c[r].f < c[i].f ? r++ : i++], c[d++] = {
                s: -1,
                f: t.f + f.f,
                l: t,
                r: f
            };
            for (f = e[0].s, t = 1; t < n; ++t) e[t].s > f && (f = e[t].s);
            var o = new ya(f + 1);
            if ((d = Ba(c[d - 1], o, 0)) > a) {
                for (c = t = 0, r = 1 << (f = d - a), e.sort(function (e, a) {
                    return o[a.s] - o[e.s] || e.f - a.f;
                }); t < n && (i = e[t].s, o[i] > a); ++t) c += r - (1 << d - o[i]), o[i] = a;
                for (c >>>= f; 0 < c;) n = e[t].s, o[n] < a ? c -= 1 << a - o[n]++ - 1 : ++t;
                for (; 0 <= t && c; --t) n = e[t].s, o[n] == a && (--o[n], ++c);
                d = a;
            }
            return [new ga(o), d];
        },
        Ba = function e(a, c, t) {
            return -1 == a.s ? Math.max(e(a.l, c, t + 1), e(a.r, c, t + 1)) : c[a.s] = t;
        },
        Ua = function (e) {
            for (var a = e.length; a && !e[--a];) ;
            for (var c = new ya(++a), t = 0, n = e[0], f = 1, r = function (e) {
                c[t++] = e;
            }, d = 1; d <= a; ++d) if (e[d] == n && d != a) ++f; else {
                if (!n && 2 < f) {
                    for (; 138 < f; f -= 138) r(32754);
                    2 < f && (r(10 < f ? f - 11 << 5 | 28690 : f - 3 << 5 | 12305), f = 0);
                } else if (3 < f) {
                    for (r(n), --f; 6 < f; f -= 6) r(8304);
                    2 < f && (r(f - 3 << 5 | 8208), f = 0);
                }
                for (; f--;) r(n);
                f = 1, n = e[d];
            }
            return [c.subarray(0, t), a];
        },
        La = function (e, a) {
            for (var c = 0, t = 0; t < a.length; ++t) c += e[t] * a[t];
            return c;
        },
        Ga = function (e, a, c) {
            var t = c.length;
            e[a = ((a += 2) / 8 >> 0) + (7 & a && 1)] = 255 & t, e[a + 1] = t >>> 8, e[a + 2] = 255 ^ e[a], e[a + 3] = 255 ^ e[a + 1];
            for (var n = 0; n < t; ++n) e[a + n + 4] = c[n];
            return 8 * (a + 4 + t);
        },
        Va = function (e, a, c, t, n, f, r, d, i, o, b) {
            Ea(a, b++, c), ++n[256];
            for (var s = (c = Fa(n, 15))[0], u = c[1], p = (c = Fa(f, 15))[0], h = c[1], l = (c = Ua(s))[0], g = c[1], y = (c = Ua(p))[0], v = c[1], m = new ya(19), w = 0; w < l.length; ++w) m[31 & l[w]]++;
            for (w = 0; w < y.length; ++w) m[31 & y[w]]++;
            c = (w = Fa(m, 7))[0], w = w[1];
            for (var _ = 19; 4 < _ && !c[_a[_ - 1]]; --_) ;
            var x = o + 5 << 3,
                S = La(n, Na) + La(f, Ta) + r;
            if (n = La(n, s) + La(f, p) + r + 14 + 3 * _ + La(m, c) + (2 * m[16] + 3 * m[17] + 7 * m[18]), x <= S && x <= n) return Ga(a, b, e.subarray(i, i + o));
            if (Ea(a, b, 1 + (n < S)), b += 2, n < S) {
                for (e = Da(s, u, 0), i = s, o = Da(p, h, 0), s = Da(c, w, 0), Ea(a, b, g - 257), Ea(a, b + 5, v - 1), Ea(a, b + 10, _ - 4), b += 14, w = 0; w < _; ++w) Ea(a, b + 3 * w, c[_a[w]]);
                for (b += 3 * _, l = [l, y], g = 0; 2 > g; ++g) for (y = l[g], w = 0; w < y.length; ++w) v = 31 & y[w], Ea(a, b, s[v]), b += c[v], 15 < v && (Ea(a, b, y[w] >>> 5 & 127), b += y[w] >>> 12);
            } else e = Ma, i = Na, o = Ra, p = Ta;
            for (w = 0; w < d; ++w) 255 < t[w] ? (v = t[w] >>> 18 & 31, qa(a, b, e[v + 257]), b += i[v + 257], 7 < v && (Ea(a, b, t[w] >>> 23 & 31), b += ma[v]), c = 31 & t[w], qa(a, b, o[c]), b += p[c], 3 < c && (qa(a, b, t[w] >>> 5 & 8191), b += wa[c])) : (qa(a, b, e[t[w]]), b += i[t[w]]);
            return qa(a, b, e[256]), b + i[256];
        },
        Wa = new va([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]),
        Ha = new ga(0),
        Za = function () {
            for (var e = new va(256), a = 0; 256 > a; ++a) {
                for (var c = a, t = 9; --t;) c = (1 & c && 3988292384) ^ c >>> 1;
                e[a] = c;
            }
            return e;
        }(),
        Xa = function () {
            var e = 4294967295;
            return {
                p: function (a) {
                    for (var c = e, t = 0; t < a.length; ++t) c = Za[255 & c ^ a[t]] ^ c >>> 8;
                    e = c;
                },
                d: function () {
                    return 4294967295 ^ e;
                }
            };
        },
        Ya = function (e, a, c, t, n) {
            return function (e, a, c, t, n, f) {
                var r = e.length,
                    d = new ga(t + r + 5 * (1 + Math.floor(r / 7e3)) + n),
                    i = d.subarray(t, d.length - n),
                    o = 0;
                if (!a || 8 > r) for (c = 0; c <= r; c += 65535) (a = c + 65535) < r ? o = Ga(i, o, e.subarray(c, a)) : (i[c] = f, o = Ga(i, o, e.subarray(c, r))); else {
                    var b = Wa[a - 1];
                    a = b >>> 13, b &= 8191;
                    for (var s = (1 << c) - 1, u = new ya(32768), p = new ya(s + 1), h = Math.ceil(c / 3), l = 2 * h, g = function (a) {
                        return (e[a] ^ e[a + 1] << h ^ e[a + 2] << l) & s;
                    }, y = new va(25e3), v = new ya(288), m = new ya(32), w = 0, _ = 0, x = (c = 0, 0), S = 0, j = 0; c < r; ++c) {
                        var A = g(c),
                            O = 32767 & c,
                            C = p[A];
                        if (u[O] = C, p[A] = O, S <= c) {
                            var I = r - c;
                            if ((7e3 < w || 24576 < x) && 423 < I) {
                                o = Va(e, i, 0, y, v, m, _, x, j, c - j, o), x = w = _ = 0, j = c;
                                for (var D = 0; 286 > D; ++D) v[D] = 0;
                                for (D = 0; 30 > D; ++D) m[D] = 0;
                            }
                            var N = 2,
                                T = 0,
                                k = b,
                                P = O - C & 32767;
                            if (2 < I && A == g(c - P)) {
                                A = Math.min(a, I) - 1;
                                var J = Math.min(32767, c);
                                for (I = Math.min(258, I); P <= J && --k && O != C;) {
                                    if (e[c + N] == e[c + N - P]) {
                                        for (D = 0; D < I && e[c + D] == e[c + D - P]; ++D) ;
                                        if (D > N) {
                                            if (N = D, T = P, D > A) break;
                                            var M = Math.min(P, D - 2),
                                                R = 0;
                                            for (D = 0; D < M; ++D) {
                                                var z = c - P + D + 32768 & 32767,
                                                    E = z - u[z] + 32768 & 32767;
                                                E > R && (R = E, C = z);
                                            }
                                        }
                                    }
                                    P += (O = C) - (C = u[O]) + 32768 & 32767;
                                }
                            }
                            T ? (y[x++] = 268435456 | ja[N] << 18 | Aa[T], S = 31 & ja[N], T = 31 & Aa[T], _ += ma[S] + wa[T], ++v[257 + S], ++m[T], S = c + N, ++w) : (y[x++] = e[c], ++v[e[c]]);
                        }
                    }
                    o = Va(e, i, f, y, v, m, _, x, j, c - j, o), f || (o = Ga(i, o, Ha));
                }
                return za(d, 0, t + ((o / 8 >> 0) + (7 & o && 1)) + n);
            }(e, null == a.level ? 6 : a.level, null == a.mem ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(e.length)))) : 12 + a.mem, c, t, !n);
        },
        $a = function (e, a, c) {
            for (; c; ++a) e[a] = c, c >>>= 8;
        },
        Ka = {
            gzipSync: W,
            compressSync: W,
            strToU8: function (e, a) {
                var c = e.length;
                if (!a && "undefined" != typeof TextEncoder) return new TextEncoder().encode(e);
                for (var t = new ga(e.length + (e.length >>> 1)), n = 0, f = function (e) {
                    t[n++] = e;
                }, r = 0; r < c; ++r) {
                    if (n + 5 > t.length) {
                        var d = new ga(n + 8 + (c - r << 1));
                        d.set(t), t = d;
                    }
                    128 > (d = e.charCodeAt(r)) || a ? f(d) : 2048 > d ? (f(192 | d >>> 6), f(128 | 63 & d)) : 55295 < d && 57344 > d ? (f(240 | (d = 65536 + (1047552 & d) | 1023 & e.charCodeAt(++r)) >>> 18), f(128 | d >>> 12 & 63), f(128 | d >>> 6 & 63), f(128 | 63 & d)) : (f(224 | d >>> 12), f(128 | d >>> 6 & 63), f(128 | 63 & d));
                }
                return za(t, 0, n);
            }
        };

    function W(e, a) {
        void 0 === a && (a = {});
        var c = Xa(),
            t = e.length;
        c.p(e);
        var n = (e = Ya(e, a, 10 + (a.filename && a.filename.length + 1 || 0), 8)).length,
            f = a;
        if (a = f.filename, e[0] = 31, e[1] = 139, e[2] = 8, e[8] = 2 > f.level ? 4 : 9 == f.level ? 2 : 0, e[9] = 3, 0 != f.mtime && $a(e, 4, Math.floor(new Date(f.mtime || Date.now()) / 1e3)), a) for (e[3] = 8, f = 0; f <= a.length; ++f) e[f + 10] = a.charCodeAt(f);
        return $a(e, n - 8, c.d()), $a(e, n - 4, t), e;
    }

    function H(e, a, c) {
        function n(e, a, c) {
            return 0 > a || a >= e["length"] ? e : (c = c[0] || "", 0 === a ? c + e["slice"](1) : e["slice"](0, a) + c + e["slice"](a + 1));
        }

        void 0 === a && (a = ""), void 0 === c && (c = !1);
        var f = function () {
                for (var e, a = ["91EBA6DBE4E5A7C8E6E3A3C1F4A4DFF9E9", "C5F5FDF5F2F5F3F5F0F5F1F5F6F5F7F5F4"], c = [], n = 0; n < a["length"]; n++) {
                    e = "";
                    for (var f = a[n], r = f["length"], d = parseInt("0x" + f["substr"](0, 2)), i = 2; i < r; i += 2) {
                        var o = parseInt("0x" + f["charAt"](i) + f["charAt"](i + 1));
                        e += String["fromCharCode"](o ^ d);
                    }
                    c["push"](e);
                }
                return c;
            }(),
            r = f[0];
        if (f = f[1], 6 === a["length"] && (r = n(r = n(r = n(r = n(r, 2, a[0]), 5, a[1]), 8, a[2]), 9, a[4]), f = n(f = n(f = n(f = n(f = n(f, 3, a[0]), 5, a[2]), 6, a[3]), 9, a[4]), 10, a[5])), a = ha["codec"]["utf8String"]["toBits"](r), r = ha["codec"]["utf8String"]["toBits"](f), a = new ha["cipher"]["aes"](a), c) return d = ha["mode"]["cbc"]["decrypt"](a, e, r), ha["codec"]["utf8String"]["fromBits"](d);
        var d = ha["mode"]["cbc"]["encrypt"](a, e, r);
        return ha["codec"]["base64"]["fromBits"](d);
    }

    function get_i() {
        var a = "w1.6";
        if (Y(), cc || X(ac, !1), !tc) try {
            !function () {
                try {
                    fc[0] = "undefined" == typeof NativeClient ? 0 : 1, fc[1] = "undefined" == typeof addEventListener ? 0 : 1;
                    try {
                        var e = wx.getPublicLibVersion(),
                            a = 0 < Object.keys(e).length ? e.system == gc.system.platform ? 1 : 0 : 2;
                    } catch (e) {
                    }
                    fc[2] = a, fc[3] = "undefined" == typeof __WeixinJSBridge ? 0 : 1;
                    var c = 4;
                    if (fc[4] = c, wx.canIUse("getNFCAdapter")) {
                        var t,
                            n = wx.getNFCAdapter(),
                            f = ((t = {}).not_open = 13001, t.no_nfc = 13e3, t);
                        n && n.startDiscovery({
                            success: function (e) {
                                void 0 === e.errCode ? (c = 1, fc[4] = c, n.stopDiscovery({
                                    success: function (e) {
                                    },
                                    fail: function (e) {
                                    }
                                })) : (e.errCode == f.no_nfc && (c = 3, fc[4] = c), e.errCode == f.not_open && (c = 2, fc[4] = c));
                            },
                            fail: function (e) {
                                c = 0, fc[4] = c;
                            }
                        });
                    }
                    fc[4] = c;
                } catch (e) {
                    try {
                        Qa && Qa.addError("ext", e);
                    } catch (e) {
                    }
                }
            }(), tc = !0;
        } catch (e) {
            try {
                Qa && Qa.addError("getFingerExt", e);
            } catch (e) {
            }
        }
        void 0 === gc.system.hasSystemProxy && (gc.system.hasSystemProxy = -1), gc.ext = fc, gc.app = nc.appId, gc.openid = nc.openId, gc.unionid = nc.unionId, gc.mchid = nc.mchId, gc.sessionId = nc.sessionId;
        var c = mc();
        gc.dfpid = c.dfpId, gc.localid = c.localId, gc.filetime = c.timestamp, gc.system.captureRecord = JSON.stringify(ic);
        var n = function (a) {
            return JSON["stringify"](function a(c, n) {
                var f,
                    r = [];
                for (n = G(n); !(f = n())["done"];) {
                    var d = c[f = f["value"]];
                    if ("LaunchOptionsSync" === f && d && (d = JSON["parse"](d), d = JSON["stringify"]({
                        path: d["path"],
                        scene: d["scene"]
                    })), "accelerometer" === f && d && Array["isArray"](d) && 0 < d["length"]) {
                        var i,
                            o = [];
                        for (d = G(d); !(i = d())["done"];) (i = i["value"]).x && i.y && i.z && o["push"]([i.x, i.y, i.z]);
                        d = o;
                    }
                    "BatteryInfo" !== f && "WifiInfo" !== f && "safeArea" !== f || d && "string" == e(d) && (d = JSON["parse"](d)), "object" == e(d) && f in pa ? r["push"](a(d, pa[f])) : r["push"](d);
                }
                return r;
            }(a, pa["DFP"]));
        }(gc);
        n = Ka.gzipSync(Ka.strToU8(n)), a += H(ha.codec.bytes.toBits(n));
        return a;
    }

// ---------------------------------------------------------------------------------------------------------------- //

    function ce(e, a) {
        void 0 === a && (a = !1);
        var c = [];
        e = e["split"]("&");
        for (var n = 0; n < e["length"]; n++) {
            var f = e[n]["split"]("=");
            if (!(1 > f["length"])) {
                var r = f[0];
                r = r["replace"](/\+/g, " "), 1 === f["length"] ? a ? c["push"]([decodeURIComponent(r), "undefined"]) : c["push"]([decodeURIComponent(r), ""]) : (f = f[1]["replace"](/\+/g, " "), c["push"]([decodeURIComponent(r), decodeURIComponent(f)]));
            }
        }
        return c;
    }

    function ae(a, c, n) {
        if (void 0 === n && (n = !1), n) for (var f in c) void 0 === (n = c[f]) ? a["push"]([ie(f), "undefined"]) : null === n ? a["push"]([ie(f), "null"]) : "object" == e(n) ? a["push"]([ie(f), ie(JSON["stringify"](c[f]))]) : a["push"]([ie(f), ie(c[f])]); else c["forEach"](function (e) {
            a["push"]([ie(e[0]), ie(e[1])]);
        });
    }

    function ie(e) {
        return encodeURIComponent(e)["replace"](/!/g, "%21")["replace"](/'/g, "%27")["replace"](/\(/g, "%28")["replace"](/\)/g, "%29")["replace"](/\*/g, "%2A");
    }

    function be(e, a) {
        return e[0] < a[0] ? -1 : e[0] > a[0] ? 1 : e[1] < a[1] ? -1 : e[1] > a[1] ? 1 : 0;
    }

    function te(e) {
        e = encodeURIComponent(e);
        for (var a = [], c = 0; c < e["length"]; c++) {
            var n = e["charAt"](c);
            "%" === n ? (n = e["charAt"](c + 1) + e["charAt"](c + 2), n = parseInt(n, 16), a["push"](n), c += 2) : a["push"](n["charCodeAt"](0));
        }
        return a;
    }

    function re(e) {
        var a = [];
        return a[0] = e >>> 24 & 255, a[1] = e >>> 16 & 255, a[2] = e >>> 8 & 255, a[3] = 255 & e, a;
    }

    function get_nt() {
        ye = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"]

        function c(e, a) {
            var c = e[0],
                n = e[1],
                t = e[2],
                i = e[3];
            n = o(n = o(n = o(n = o(n = d(n = d(n = d(n = d(n = r(n = r(n = r(n = r(n = f(n = f(n = f(n = f(n, t = f(t, i = f(i, c = f(c, n, t, i, a[0], 7, -680876936), n, t, a[1], 12, -389564586), c, n, a[2], 17, 606105819), i, c, a[3], 22, -1044525330), t = f(t, i = f(i, c = f(c, n, t, i, a[4], 7, -176418897), n, t, a[5], 12, 1200080426), c, n, a[6], 17, -1473231341), i, c, a[7], 22, -45705983), t = f(t, i = f(i, c = f(c, n, t, i, a[8], 7, 1770035416), n, t, a[9], 12, -1958414417), c, n, a[10], 17, -42063), i, c, a[11], 22, -1990404162), t = f(t, i = f(i, c = f(c, n, t, i, a[12], 7, 1804603682), n, t, a[13], 12, -40341101), c, n, a[14], 17, -1502002290), i, c, a[15], 22, 1236535329), t = r(t, i = r(i, c = r(c, n, t, i, a[1], 5, -165796510), n, t, a[6], 9, -1069501632), c, n, a[11], 14, 643717713), i, c, a[0], 20, -373897302), t = r(t, i = r(i, c = r(c, n, t, i, a[5], 5, -701558691), n, t, a[10], 9, 38016083), c, n, a[15], 14, -660478335), i, c, a[4], 20, -405537848), t = r(t, i = r(i, c = r(c, n, t, i, a[9], 5, 568446438), n, t, a[14], 9, -1019803690), c, n, a[3], 14, -187363961), i, c, a[8], 20, 1163531501), t = r(t, i = r(i, c = r(c, n, t, i, a[13], 5, -1444681467), n, t, a[2], 9, -51403784), c, n, a[7], 14, 1735328473), i, c, a[12], 20, -1926607734), t = d(t, i = d(i, c = d(c, n, t, i, a[5], 4, -378558), n, t, a[8], 11, -2022574463), c, n, a[11], 16, 1839030562), i, c, a[14], 23, -35309556), t = d(t, i = d(i, c = d(c, n, t, i, a[1], 4, -1530992060), n, t, a[4], 11, 1272893353), c, n, a[7], 16, -155497632), i, c, a[10], 23, -1094730640), t = d(t, i = d(i, c = d(c, n, t, i, a[13], 4, 681279174), n, t, a[0], 11, -358537222), c, n, a[3], 16, -722521979), i, c, a[6], 23, 76029189), t = d(t, i = d(i, c = d(c, n, t, i, a[9], 4, -640364487), n, t, a[12], 11, -421815835), c, n, a[15], 16, 530742520), i, c, a[2], 23, -995338651), t = o(t, i = o(i, c = o(c, n, t, i, a[0], 6, -198630844), n, t, a[7], 10, 1126891415), c, n, a[14], 15, -1416354905), i, c, a[5], 21, -57434055), t = o(t, i = o(i, c = o(c, n, t, i, a[12], 6, 1700485571), n, t, a[3], 10, -1894986606), c, n, a[10], 15, -1051523), i, c, a[1], 21, -2054922799), t = o(t, i = o(i, c = o(c, n, t, i, a[8], 6, 1873313359), n, t, a[15], 10, -30611744), c, n, a[6], 15, -1560198380), i, c, a[13], 21, 1309151649), t = o(t, i = o(i, c = o(c, n, t, i, a[4], 6, -145523070), n, t, a[11], 10, -1120210379), c, n, a[2], 15, 718787259), i, c, a[9], 21, -343485551), e[0] = c + e[0] & 4294967295, e[1] = n + e[1] & 4294967295, e[2] = t + e[2] & 4294967295, e[3] = i + e[3] & 4294967295;
        }

        function t(e, a, c, n, t, f) {
            return ((a = (a + e & 4294967295) + (n + f & 4294967295) & 4294967295) << t | a >>> 32 - t) + c & 4294967295;
        }

        function f(e, a, c, n, f, r, d) {
            return t(a & c | ~a & n, e, a, f, r, d);
        }

        function r(e, a, c, n, f, r, d) {
            return t(a & n | c & ~n, e, a, f, r, d);
        }

        function d(e, a, c, n, f, r, d) {
            return t(a ^ c ^ n, e, a, f, r, d);
        }

        function o(e, a, c, n, f, r, d) {
            return t(c ^ (a | ~n), e, a, f, r, d);
        }

        function i(e) {
            var a,
                n = e.length,
                t = [1732584193, -271733879, -1732584194, 271733878];
            for (a = 64; a <= e.length; a += 64) {
                var f,
                    r = e.subarray(a - 64, a),
                    d = [];
                for (f = 0; 64 > f; f += 4) d[f >> 2] = r[f] + (r[f + 1] << 8) + (r[f + 2] << 16) + (r[f + 3] << 24);
                c(t, d);
            }
            for (e = e.subarray(a - 64), f = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], a = 0; a < e.length; a++) f[a >> 2] |= e[a] << (a % 4 << 3);
            if (f[a >> 2] |= 128 << (a % 4 << 3), 55 < a) for (c(t, f), a = 0; 16 > a; a++) f[a] = 0;
            return f[14] = 8 * n, c(t, f), t;
        }

        function b(e) {
            for (var a = 0; a < e.length; a++) {
                for (var c = a, n = e[a], t = "", f = 0; 4 > f; f++) t += ye[n >> 8 * f + 4 & 15] + ye[n >> 8 * f & 15];
                e[c] = t;
            }
            return e.join("");
        }

        return {
            md5: function (e) {
                return b(i(e));
            },
            md5Array: i,
            md5ToHex: b
        }
    }

    var Oe = get_nt()


    function fe(e) {
        for (var a = [], c = 0; c < e["length"]; c += 2) {
            var n = e["charAt"](c) + e["charAt"](c + 1);
            n = parseInt(n, 16), a["push"](n);
        }
        return a;
    }

    qc = function () {
        for (var a, c, n = 256, f = []; n--; f[n] = a >>> 0) for (c = 8, a = n; c--;) a = 1 & a ? a >>> 1 ^ 3988292384 : a >>> 1;
        return function (a) {
            if ("string" == e(a)) {
                for (var c = 0, n = -1; c < a["length"]; ++c) n = f[255 & n ^ a["charCodeAt"](c)] ^ n >>> 8;
                return 306674911 ^ n;
            }
            for (c = 0, n = -1; c < a["length"]; ++c) n = f[255 & n ^ a[c]] ^ n >>> 8;
            return 306674911 ^ n;
        };
    }()

    function oe(e, a, c) {
        for (var n, f = [], r = a; r < c; r += 3) a = (e[r] << 16 & 16711680) + (e[r + 1] << 8 & 65280) + (255 & e[r + 2]), f["push"](Tc[(n = a) >> 18 & 63] + Tc[n >> 12 & 63] + Tc[n >> 6 & 63] + Tc[63 & n]);
        return f["join"]("");
    }


    function he(e, a) {
        var c = e["length"];
        a ^= c;
        for (var n = 0; 4 <= c;) {
            var f = 1540483477 * (65535 & (f = 255 & e[n] | (255 & e[++n]) << 8 | (255 & e[++n]) << 16 | (255 & e[++n]) << 24)) + ((1540483477 * (f >>> 16) & 65535) << 16);
            a = 1540483477 * (65535 & a) + ((1540483477 * (a >>> 16) & 65535) << 16) ^ (f = 1540483477 * (65535 & (f ^= f >>> 24)) + ((1540483477 * (f >>> 16) & 65535) << 16)), c -= 4, ++n;
        }
        switch (c) {
            case 3:
                a ^= (255 & e[n + 2]) << 16;
            case 2:
                a ^= (255 & e[n + 1]) << 8;
            case 1:
                a = 1540483477 * (65535 & (a ^= 255 & e[n])) + ((1540483477 * (a >>> 16) & 65535) << 16);
        }
        return ((a = 1540483477 * (65535 & (a ^= a >>> 13)) + ((1540483477 * (a >>> 16) & 65535) << 16)) ^ a >>> 15) >>> 0 ^ 1540483477;
    }

    function de(e) {
        return void 0 === e && (e = []), e["map"](function (e) {
            return "" + (c = "0123456789abcdef".split(""))[(a = e) >>> 4 & 15] + c[15 & a];
            var a, c;
        })["join"]("");
    }

    kc = '1.2'
    Pc = gc['app']
    zc = 'application/x-www-form-urlencoded'
    Ec = 'application/json'

    function se(e, c) {
        for (var a = !1, n = 0, f = Object['keys'](e); n < f['length']; n++) {
            var r = f[n];
            if ('content-type' === r['toLowerCase']() && (a = !0,
            e[r] && e[r]['toLowerCase']()['startsWith'](c)))
                return !0
        }
        return c === Ec && !a
    }

    function ne(e) {
        return 16200 < e['length'] && (e = e['slice'](0, 16200)),
            e
    }

    function mtgsig(c, n) {
        if (void 0 === n && (n = !1), Jc += 1, Cc["b8"] = Jc, c) {
            var r = c["header"] || {},
                d = (c["method"] || "GET")["toUpperCase"](),
                i = "GET" !== d && se(r, zc),
                o = ("GET" !== d && se(r, Ec), new Date()["valueOf"]() + Dc["finger"]["std"]());
            r = c["url"] || "";
            var b = c["data"];
            c["header"] && "object" == e(c["header"]) || (c["header"] = {});
            var s = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/["exec"](r);
            r = "/";
            var u = [];
            s && (s[5] && (r += s[5]), s[6] && (u = ce(s[6])));
            var p = [],
                h = "",
                l = [];
            if ("GET" === d) {
                if ("object" == e(b) && 0 < Object["keys"](b)["length"]) {
                    if (ae(p, b, !0), s && s[6] && 0 < u["length"]) {
                        var g = {};
                        (u = ce(s[6], !0))["forEach"](function (e) {
                            b["hasOwnProperty"](e[0]) || (g[e[0]] = e[1]);
                        }), ae(p, g, !0);
                    }
                } else ae(p, u);
            } else if (ae(p, u), i) if ("string" == e(b)) h = b; else if ("object" == e(b)) {
                !function (e, a) {
                    for (var c in a) e["push"]([encodeURIComponent(c), encodeURIComponent(a[c])]);
                }(l, b);
                var y = [];
                l["forEach"](function (e) {
                    y["push"](e[0] + "=" + e[1]);
                }), h = y["join"]("&");
            }
            var v = "";
            n && (v = get_i()), []["concat"](p), p["sort"](be);
            var m = [];
            p["forEach"](function (e) {
                m["push"](e[0] + "=" + e[1]);
            });
            var w = te(d + " " + r + " " + m["join"]("&"));
            if (i || "GET" === d || null == b || ("string" == e(b) ? w["push"]["apply"](w, ne(te(b))) : w["push"]["apply"](w, ne(te(JSON["stringify"](b))))), 0 < h["length"] && w["push"]["apply"](w, ne(te(h))), n = "", "undefined" != ("undefined" == typeof getCurrentPages ? "undefined" : e(getCurrentPages))) {
                d = getCurrentPages();
                try {
                    d && (n = 0 === d["length"] ? "" : d[d["length"] - 1]["route"] || "");
                } catch (e) {
                }
            }
            Cc["b2"] = n, n = "", void 0 !== (d = function () {
                for (var c = 137; ;) switch (a[c++]) {
                    case 0:
                        var n = 0;
                        var h = re(r = 4294967295 & o),
                            l = new Uint8Array(te(v)["concat"](h)),
                            g = Oe["md5"](l),
                            y = fe(g["substring"](0, 15));
                        y[7] = 255 & (n ^ qc(h)), y["push"]["apply"](y, h), y["push"]["apply"](y, re(4294967295 & qc(y)));
                        var m = function (e) {
                                for (var c, n = [], f = Function.prototype.call, r = 0; ;) switch (a[r++]) {
                                    case 0:
                                        n.push(a[r++]);
                                        continue;
                                    case 1:
                                        n[n.length - 3] = f.call(n[n.length - 3], n[n.length - 2], n[n.length - 1]);
                                        continue;
                                    case 2:
                                        n[n.length - 2] -= n[n.length - 1];
                                        continue;
                                    case 4:
                                        n[n.length - 2] %= n[n.length - 1];
                                        continue;
                                    case 5:
                                        n.length -= 2;
                                        continue;
                                    case 6:
                                        n.push(e);
                                        continue;
                                    case 7:
                                        n.pop();
                                        continue;
                                    case 8:
                                        n.push(oe);
                                        continue;
                                    case 9:
                                        n.push(null);
                                        continue;
                                    case 11:
                                        n.push(o);
                                        continue;
                                    case 12:
                                        n[n.length - 0] = [];
                                        continue;
                                    case 16:
                                        n[n.length - 5] = f.call(n[n.length - 5], n[n.length - 4], n[n.length - 3], n[n.length - 2], n[n.length - 1]);
                                        continue;
                                    case 17:
                                        var d = n.pop();
                                        continue;
                                    case 19:
                                        n[n.length - 2] = n[n.length - 2] < n[n.length - 1];
                                        continue;
                                    case 20:
                                        !n.pop() && (r += 25);
                                        continue;
                                    case 21:
                                        n.push(d + 16383 > b ? b : d + 16383);
                                        continue;
                                    case 23:
                                        n.push((1 === o ? (c = e[s - 1], i["push"](Tc[c >> 2] + Tc[c << 4 & 63] + "==")) : 2 === o && (c = (e[s - 2] << 8) + e[s - 1], i["push"](Tc[c >> 10] + Tc[c >> 4 & 63] + Tc[c << 2 & 63] + "=")), i["join"]("")));
                                        continue;
                                    case 24:
                                        d += n[n.length - 1];
                                        continue;
                                    case 25:
                                        n.push(i);
                                        continue;
                                    case 26:
                                        n.push(d);
                                        continue;
                                    case 28:
                                        n.push(t);
                                        continue;
                                    case 30:
                                        r -= 30;
                                        continue;
                                    case 32:
                                        var i = n.pop();
                                        continue;
                                    case 35:
                                        n.push(b);
                                        continue;
                                    case 36:
                                        n[n.length - 2] = n[n.length - 2][n[n.length - 1]];
                                        continue;
                                    case 37:
                                        n.push(s);
                                        continue;
                                    case 38:
                                        var o = n.pop();
                                        continue;
                                    case 39:
                                        var b = n.pop();
                                        continue;
                                    case 44:
                                        return;
                                    case 45:
                                        n.length -= 4;
                                        continue;
                                    case 48:
                                        var s = n.pop();
                                        continue;
                                    case 53:
                                        return n.pop();
                                }
                            }(y["concat"](function (e, c) {
                                for (var n, f, r = [], d = Function.prototype.call, i = 93; ;) switch (a[i++]) {
                                    case 0:
                                        return r.pop();
                                    case 2:
                                        r.push(a[i++]);
                                        continue;
                                    case 3:
                                        r.pop();
                                        continue;
                                    case 4:
                                        r.push(o++);
                                        continue;
                                    case 5:
                                        return;
                                    case 6:
                                        b[o] = r[r.length - 1];
                                        continue;
                                    case 7:
                                        r[r.length - 2] = r[r.length - 2] < r[r.length - 1];
                                        continue;
                                    case 9:
                                        r.push(o);
                                        continue;
                                    case 13:
                                        r[r.length - 5] = d.call(r[r.length - 5], r[r.length - 4], r[r.length - 3], r[r.length - 2], r[r.length - 1]);
                                        continue;
                                    case 14:
                                        r.push(n);
                                        continue;
                                    case 17:
                                        r.push(c);
                                        continue;
                                    case 18:
                                        var o = r[r.length - 1];
                                        continue;
                                    case 19:
                                        r.push(b);
                                        continue;
                                    case 22:
                                        r[r.length - 0] = [];
                                        continue;
                                    case 23:
                                        o = r.pop();
                                        continue;
                                    case 26:
                                        r.length -= 4;
                                        continue;
                                    case 29:
                                        r.push((f = (f + b[o] + e[o % e["length"]] + 31) % 256, n = b[o], b[o] = b[f], b[f] = n));
                                        continue;
                                    case 31:
                                        r.push(function (e, c, n) {
                                            for (var f = [], r = Function.prototype.call, d = 59; ;) switch (a[d++]) {
                                                case 0:
                                                    var i = f.pop();
                                                    continue;
                                                case 2:
                                                    var o = f.pop();
                                                    continue;
                                                case 3:
                                                    f.push(t);
                                                    continue;
                                                case 4:
                                                    f[f.length - 2] = f[f.length - 2] < f[f.length - 1];
                                                    continue;
                                                case 5:
                                                    f.length -= 2;
                                                    continue;
                                                case 6:
                                                    f.push(s);
                                                    continue;
                                                case 7:
                                                    return;
                                                case 8:
                                                    d -= 10;
                                                    continue;
                                                case 10:
                                                    var b = f.pop();
                                                    continue;
                                                case 11:
                                                    f.push(n);
                                                    continue;
                                                case 12:
                                                    f.push(a[d++]);
                                                    continue;
                                                case 13:
                                                    var s = f.pop();
                                                    continue;
                                                case 15:
                                                    f.pop();
                                                    continue;
                                                case 16:
                                                    var u = f.pop();
                                                    continue;
                                                case 17:
                                                    f.push(u++);
                                                    continue;
                                                case 21:
                                                    f.push((o = (o + e[b = (b + 1) % 256]) % 256, c = e[b], e[b] = e[o], e[o] = c, i["push"](n["charCodeAt"](u) ^ e[(e[b] + e[o]) % 256])));
                                                    continue;
                                                case 22:
                                                    f[f.length - 2] = f[f.length - 2][f[f.length - 1]];
                                                    continue;
                                                case 23:
                                                    f.push(i);
                                                    continue;
                                                case 24:
                                                    f[f.length - 3] = r.call(f[f.length - 3], f[f.length - 2], f[f.length - 1]);
                                                    continue;
                                                case 25:
                                                    f[f.length - 0] = [];
                                                    continue;
                                                case 27:
                                                    !f.pop() && (d += 5);
                                                    continue;
                                                case 28:
                                                    return f.pop();
                                                case 30:
                                                    f.push(null);
                                                    continue;
                                                case 31:
                                                    f.push(u);
                                            }
                                        });
                                        continue;
                                    case 32:
                                        i -= 11;
                                        continue;
                                    case 33:
                                        !r.pop() && (i += 5);
                                        continue;
                                    case 34:
                                        r.push(null);
                                        continue;
                                    case 37:
                                        var b = r.pop();
                                        continue;
                                    case 39:
                                        f = r.pop();
                                        continue;
                                    case 40:
                                        !r.pop() && (i += 6);
                                        continue;
                                    case 42:
                                        i -= 12;
                                }
                            }(y, JSON["stringify"](Cc)))),
                            _ = he(w, o),
                            x = re(_),
                            S = he(new Uint8Array(te(m)), o),
                            j = re(S),
                            A = fe(Oe["md5ToHex"]([_, S, _ ^ r, _ ^ S ^ r])),
                            O = de(x["concat"](j)["concat"](A));
                        (n = {})["a1"] = kc, n["a2"] = o, n["a3"] = Dc["finger"].d(), n["a4"] = O, n["a5"] = m, n["a6"] = v, n["a7"] = Pc, n["x0"] = 3, d = S >>> 0;
                        var C = n["a1"] + n["a2"] + n["a3"] + n["a4"] + d + g + n["a7"],
                            I = Oe["md5Array"](new Uint8Array(te(C))),
                            D = r << n["x0"] | r << 32 - n["x0"];
                        return I[0] ^= D, I[1] ^= d, I[2] = I[2] ^ d ^ D, I[3] ^= I[0], n["d1"] = Oe["md5ToHex"](I), n;
                        continue;
                    case 1:
                        return;
                }
            }()) && (n = JSON["stringify"](d), c["header"]["mtgsig"] = n);
        }
        return c;
    }

    return function (method, url, data) {
        let data_info = {
            "url": url,
            "data": data,
            "header": {},
            "method": method,
            "isRequest": true,
            "useSign": true,
            "wxNameSpace": "main",
            "noSaftyRequest": false
        }
        return mtgsig(data_info, true)['header']['mtgsig']
    }
}
function get_Sign(method, url, data, dfpid, wxstr) {
    return Mtgsig_init(dfpid, wxstr)(method, url, data)
}

  }(y, JSON["stringify"](Cc)))),
                            _ = he(w, o),
                            x = re(_),
                            S = he(new Uint8Array(te(m)), o),
                            j = re(S),
                            A = fe(Oe["md5ToHex"]([_, S, _ ^ r, _ ^ S ^ r])),
                            O = de(x["concat"](j)["concat"](A));
                        (n = {})["a1"] = kc, n["a2"] = o, n["a3"] = Dc["finger"].d(), n["a4"] = O, n["a5"] = m, n["a6"] = v, n["a7"] = Pc, n["x0"] = 3, d = S >>> 0;
                        var C = n["a1"] + n["a2"] + n["a3"] + n["a4"] + d + g + n["a7"],
                            I = Oe["md5Array"](new Uint8Array(te(C))),
                            D = r << n["x0"] | r << 32 - n["x0"];
                        return I[0] ^= D, I[1] ^= d, I[2] = I[2] ^ d ^ D, I[3] ^= I[0], n["d1"] = Oe["md5ToHex"](I), n;
                        continue;
                    case 1:
                        return;
                }
            }()) && (n = JSON["stringify"](d), c["header"]["mtgsig"] = n);
        }
        return c;
    }

    return function (method, url, data) {
        let data_info = {
            "url": url,
            "data": data,
            "header": {},
            "method": method,
            "isRequest": true,
            "useSign": true,
            "wxNameSpace": "main",
            "noSaftyRequest": false
        }
        return mtgsig(data_info, true)['header']['mtgsig']
    }
}
function get_Sign(method, url, data, dfpid, wxstr) {
    return Mtgsig_init(dfpid, wxstr)(method, url, data)
}

module.exports = { get_Sign };
