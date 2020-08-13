"use strict";
!function(e) {
    var t = function(e) {
        var t = "";
        for (var i in e)
            e.hasOwnProperty(i) && (t += (t ? "&" : "") + i + "=" + e[i]);
        return t
    }
      , i = function() {
        this.queue = [],
        this.baseUrl = "https://api2.goodgame.ru/v2/"
    };
    i.prototype.getStreams = function(e, t, i) {
        this._request("streams", e, t, i)
    }
    ,
    i.prototype.getStream = function(e, t, i) {
        this._request("streams/" + e, {}, t, i)
    }
    ,
    i.prototype._request = function(e, i, n, s) {
        var r = this
          , o = 0
          , a = function() {
            if (o++ > 2)
                return s();
            var c = new XMLHttpRequest;
            s = s || function() {}
            ,
            c.open("GET", r.baseUrl + e + "?" + t(i), !0),
            c.onreadystatechange = function() {
                if (4 == this.readyState) {
                    if (0 === this.status && "" === this.responseText)
                        return setTimeout(a, 1e3);
                    try {
                        n(JSON.parse(this.responseText))
                    } catch (e) {
                        s(this.responseText)
                    }
                }
            }
            ,
            c.onerror = function() {
                setTimeout(a, 1e3)
            }
            ,
            c.onabort = function() {
                setTimeout(a, 1e3)
            }
            ,
            c.send()
        };
        a()
    }
    ,
    e.GgApi = new i
}(window),
function(e) {
    var t = !1
      , i = function() {
        return t ? t : t = new n
    }
      , n = function() {
        this.events = {
            channel: [],
            list: []
        },
        window.addEventListener("hashchange", this._checkState.bind(this)),
        document.addEventListener("keydown", function(e) {
            var t = e.keyCode;
            27 == t && (window.location.hash = "#")
        }, !1),
        this._checkState()
    };
    n.prototype._currentState = function(e) {
        return e ? e === this._currentState() : window.location.hash && "#" !== window.location.hash ? "channel" : "list"
    }
    ,
    n.prototype._checkState = function() {
        this._trigger(this._currentState(), window.location.hash.slice(1))
    }
    ,
    n.prototype._trigger = function(e, t) {
        for (var i in this.events)
            for (var n in this.events[i])
                this.events[i][n][i === e ? "start" : "stop"](t)
    }
    ,
    n.prototype.goList = function() {
        this._trigger("list", "#")
    }
    ,
    n.prototype.onChannel = function(e, t) {
        var i = function() {}
          , n = {
            start: e || i,
            stop: t || i
        };
        this.events.channel.push(n),
        n[this._currentState("channel") ? "start" : "stop"](window.location.hash && window.location.hash.slice(1))
    }
    ,
    n.prototype.onList = function(e, t) {
        var i = function() {}
          , n = {
            start: e || i,
            stop: t || i
        };
        this.events.list.push(n),
        n[this._currentState("list") ? "start" : "stop"](window.location.hash && window.location.hash.slice(1))
    }
    ,
    e.Router = i
}(window),
function() {
    var e = function() {
        this.enabled = !1,
        this.splitted = !1,
        this.dom = {
            player: document.getElementById("player"),
            chat_inner: document.getElementById("chat_inner"),
            player_content: document.getElementById("player_content")
        },
        this.init()
    };
    e.prototype.splitInit = function() {
        this.splitted || (Split(["#player", "#chat"], {
            sizes: [75, 25],
            minSize: 100,
            gutterSize: 5
        }),
        this.splitted = !0)
    }
    ,
    e.prototype.createView = function(e, t) {
        this.getStream(e),
        this.id = e
    }
    ,
    e.prototype.disableView = function() {
        this.enabled && (this.dom.player.innerHTML = "",
        this.dom.chat_inner.innerHTML = "",
        this.dom.player_content.style.display = "none",
        this.enabled = !1)
    }
    ,
    e.prototype.init = function() {
        Router().onChannel(this.createView.bind(this), this.disableView.bind(this))
    }
    ,
    e.prototype.getStream = function(e) {
        var t = this;
        return window.GgApi.getStream(e, function(e) {
            t.onLoaded(e)
        }, function() {
            Router().goList()
        }),
        !0
    }
    ,
    e.prototype.onLoaded = function(e) {
        if (!e || e.status && 404 === e.status)
            return void (window.location.hash = "#");
        var t = e.channel.embed;
        t = t.replace("<iframe ", '<iframe allowfullscreen="allowfullscreen"'),
        this.dom.player.innerHTML = t,
        this.dom.chat_inner.innerHTML = '<iframe frameborder="0" allowfullscreen="allowfullscreen" width="100%" height="100%" src="https://goodgame.ru/chat/' + this.id + '/"></iframe>',
        this.dom.player_content.style.display = "block",
        this.enabled = !0,
        this.splitInit()
    }
    ,
    new e
}(),
function() {
    var e = this
      , t = e.attachEvent && !e[n]
      , i = e.document
      , n = "addEventListener"
      , s = "removeEventListener"
      , r = "getBoundingClientRect"
      , o = function() {
        for (var e, t = ["", "-webkit-", "-moz-", "-o-"], n = 0; n < t.length; n++)
            if (e = i.createElement("div"),
            e.style.cssText = "width:" + t[n] + "calc(9px)",
            e.style.length)
                return t[n] + "calc"
    }()
      , a = function(e) {
        return "string" == typeof e || e instanceof String ? i.querySelector(e) : e
    }
      , c = function(c, h) {
        var l, d, u, p, m, g, f, y, v = [];
        h = "undefined" != typeof h ? h : {},
        "undefined" == typeof h.gutterSize && (h.gutterSize = 10),
        "undefined" == typeof h.minSize && (h.minSize = 100),
        "undefined" == typeof h.snapOffset && (h.snapOffset = 30),
        "undefined" == typeof h.direction && (h.direction = "horizontal"),
        "horizontal" == h.direction ? (l = "width",
        u = "clientWidth",
        p = "clientX",
        m = "left",
        g = "gutter gutter-horizontal",
        f = "paddingLeft",
        y = "paddingRight",
        h.cursor || (h.cursor = "ew-resize")) : "vertical" == h.direction && (l = "height",
        u = "clientHeight",
        p = "clientY",
        m = "top",
        g = "gutter gutter-vertical",
        f = "paddingTop",
        y = "paddingBottom",
        h.cursor || (h.cursor = "ns-resize"));
        var b = function(t) {
            var i = this
              , s = i.a
              , r = i.b;
            !i.dragging && h.onDragStart && h.onDragStart(),
            t.preventDefault(),
            i.dragging = !0,
            i.move = w.bind(i),
            i.stop = S.bind(i),
            e[n]("mouseup", i.stop),
            e[n]("touchend", i.stop),
            e[n]("touchcancel", i.stop),
            i.parent[n]("mousemove", i.move),
            i.parent[n]("touchmove", i.move),
            s[n]("selectstart", x),
            s[n]("dragstart", x),
            r[n]("selectstart", x),
            r[n]("dragstart", x),
            s.style.userSelect = "none",
            s.style.webkitUserSelect = "none",
            s.style.MozUserSelect = "none",
            s.style.pointerEvents = "none",
            r.style.userSelect = "none",
            r.style.webkitUserSelect = "none",
            r.style.MozUserSelect = "none",
            r.style.pointerEvents = "none",
            i.gutter.style.cursor = h.cursor,
            i.parent.style.cursor = h.cursor,
            z.call(i)
        }
          , S = function() {
            var t = this
              , i = t.a
              , n = t.b;
            t.dragging && h.onDragEnd && h.onDragEnd(),
            t.dragging = !1,
            e[s]("mouseup", t.stop),
            e[s]("touchend", t.stop),
            e[s]("touchcancel", t.stop),
            t.parent[s]("mousemove", t.move),
            t.parent[s]("touchmove", t.move),
            delete t.stop,
            delete t.move,
            i[s]("selectstart", x),
            i[s]("dragstart", x),
            n[s]("selectstart", x),
            n[s]("dragstart", x),
            i.style.userSelect = "",
            i.style.webkitUserSelect = "",
            i.style.MozUserSelect = "",
            i.style.pointerEvents = "",
            n.style.userSelect = "",
            n.style.webkitUserSelect = "",
            n.style.MozUserSelect = "",
            n.style.pointerEvents = "",
            t.gutter.style.cursor = "",
            t.parent.style.cursor = ""
        }
          , w = function(e) {
            var t;
            this.dragging && (t = "touches"in e ? e.touches[0][p] - this.start : e[p] - this.start,
            t <= this.aMin + h.snapOffset + this.aGutterSize ? t = this.aMin + this.aGutterSize : t >= this.size - (this.bMin + h.snapOffset + this.bGutterSize) && (t = this.size - (this.bMin + this.bGutterSize)),
            _.call(this, t),
            h.onDrag && h.onDrag())
        }
          , z = function() {
            var t = e.getComputedStyle(this.parent)
              , i = this.parent[u] - parseFloat(t[f]) - parseFloat(t[y]);
            this.size = this.a[r]()[l] + this.b[r]()[l] + this.aGutterSize + this.bGutterSize,
            this.percentage = Math.min(this.size / i * 100, 100),
            this.start = this.a[r]()[m]
        }
          , _ = function(e) {
            this.a.style[l] = o + "(" + e / this.size * this.percentage + "% - " + this.aGutterSize + "px)",
            this.b.style[l] = o + "(" + (this.percentage - e / this.size * this.percentage) + "% - " + this.bGutterSize + "px)"
        }
          , L = function() {
            var e = this
              , t = e.a
              , i = e.b;
            t[r]()[l] < e.aMin ? (t.style[l] = e.aMin - e.aGutterSize + "px",
            i.style[l] = e.size - e.aMin - e.aGutterSize + "px") : i[r]()[l] < e.bMin && (t.style[l] = e.size - e.bMin - e.bGutterSize + "px",
            i.style[l] = e.bMin - e.bGutterSize + "px")
        }
          , M = function() {
            var e = this
              , t = e.a
              , i = e.b;
            i[r]()[l] < e.bMin ? (t.style[l] = e.size - e.bMin - e.bGutterSize + "px",
            i.style[l] = e.bMin - e.bGutterSize + "px") : t[r]()[l] < e.aMin && (t.style[l] = e.aMin - e.aGutterSize + "px",
            i.style[l] = e.size - e.aMin - e.aGutterSize + "px")
        }
          , G = function(e) {
            for (var t = 0; t < e.length; t++)
                z.call(e[t]),
                L.call(e[t]);
            for (t = e.length - 1; t >= 0; t--)
                z.call(e[t]),
                M.call(e[t])
        }
          , k = function(e, i, n) {
            "string" == typeof i || i instanceof String || (i = t ? h.sizes[d] + "%" : o + "(" + i + "% - " + n + "px)"),
            e.style[l] = i
        }
          , x = function() {
            return !1
        }
          , E = a(c[0]).parentNode;
        if (!h.sizes) {
            var T = 100 / c.length;
            for (h.sizes = [],
            d = 0; d < c.length; d++)
                h.sizes.push(T)
        }
        if (!Array.isArray(h.minSize)) {
            var H = [];
            for (d = 0; d < c.length; d++)
                H.push(h.minSize);
            h.minSize = H
        }
        for (d = 0; d < c.length; d++) {
            var P, O = a(c[d]), A = 1 == d, U = d == c.length - 1, C = h.sizes[d], R = h.gutterSize;
            if (d > 0 && (P = {
                a: a(c[d - 1]),
                b: O,
                aMin: h.minSize[d - 1],
                bMin: h.minSize[d],
                dragging: !1,
                parent: E,
                isFirst: A,
                isLast: U,
                direction: h.direction
            },
            P.aGutterSize = h.gutterSize,
            P.bGutterSize = h.gutterSize,
            A && (P.aGutterSize = h.gutterSize / 2),
            U && (P.bGutterSize = h.gutterSize / 2)),
            !t) {
                if (d > 0) {
                    var q = i.createElement("div");
                    q.className = g,
                    q.style[l] = h.gutterSize + "px",
                    q[n]("mousedown", b.bind(P)),
                    q[n]("touchstart", b.bind(P)),
                    E.insertBefore(q, O),
                    P.gutter = q
                }
                0 !== d && d != c.length - 1 || (R = h.gutterSize / 2)
            }
            k(O, C, R),
            d > 0 && v.push(P)
        }
        return G(v),
        {
            setSizes: function(e) {
                for (var t = 0; t < e.length; t++)
                    if (t > 0) {
                        var i = v[t - 1];
                        k(i.a, e[t - 1], i.aGutterSize),
                        k(i.b, e[t], i.bGutterSize)
                    }
            },
            collapse: function(e) {
                var t;
                e === v.length ? (t = v[e - 1],
                z.call(t),
                _.call(t, t.size - t.bGutterSize)) : (t = v[e],
                z.call(t),
                _.call(t, t.aGutterSize))
            },
            destroy: function() {
                for (var e = 0; e < v.length; e++)
                    v[e].parent.removeChild(v[e].gutter),
                    v[e].a.style[l] = "",
                    v[e].b.style[l] = ""
            }
        }
    };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = c),
    exports.Split = c) : e.Split = c
}
.call(window),
function(e) {
    function t(e) {
        for (var t = e + "=", i = decodeURIComponent(document.cookie), n = i.split(";"), s = 0; s < n.length; s++) {
            for (var r = n[s]; " " == r.charAt(0); )
                r = r.substring(1);
            if (0 == r.indexOf(t))
                return "1" === r.substring(t.length, r.length)
        }
        return !0
    }
    var i = '<a class="stream-item !!hidden!! !!premium!! !!adult!! !!player!! " href="#!!id!!"> <div class="inner"><span class="viewers"><span class="icon-users"></span> &#128100; !!user_count!! </span> <span class="stream-info"><span class="name">!!name!!</span><span class="stream">!!desc!!</span></span><img class="preview" src="!!thumb!!" onerror="this.src=\'https://goodgame.ru/images/ico_tv.png\'"></div></a>'
      , n = function() {
        this.showHidden = t("hidden"),
        this.showOthers = t("other"),
        this.showPremium = t("premium"),
        this.filterAdult = t("adult"),
        this.fiterTwitch = t("twitch"),
        this.enabled = !0,
        this.loadedPage = 0,
        this.page_count = -1,
        e.addEventListener("load", this.init.bind(this))
    };
    n.prototype.init = function() {
        var e = this;
        this.dom = {
            streams_list: document.querySelector("#streams_list")
        };
        var t = ["showHidden", "showOthers", "showPremium", "filterAdult", "fiterTwitch "];
        for (var i in t) {
            var n = document.getElementById(t[i]);
            n && (n.checked = e[t[i]],
            n.addEventListener("change", function(n) {
                e.filterSwitch(t[i], n.target.checked)
            }))
        }
        document.addEventListener("scroll", this.checkScrool.bind(this)),
        Router().onList(this.enable.bind(this), this.disable.bind(this)),
        this.checkScrool()
    }
    ,
    n.prototype.reset = function() {
        this.loadedPage = 0,
        this.page_count = -1,
        this.dom.streams_list.innerHTML = "",
        this.nextPage()
    }
    ,
    n.prototype.enable = function() {
        this.enabled = !0,
        this.dom.streams_list.style.display = "block",
        this.checkScrool()
    }
    ,
    n.prototype.disable = function() {
        this.enabled = !1,
        this.dom.streams_list.style.display = "none"
    }
    ,
    n.prototype.onLoaded = function(e) {
        if (e && e._embedded && e._embedded.streams) {
            this.page_count = e.page_count;
            var t, n, s = "";
            for (var r in e._embedded.streams) {
                switch (n = !1,
                n = n || this.showHidden && e._embedded.streams[r].channel.hidden,
                n = n || this.showPremium && "true" === e._embedded.streams[r].channel.premium,
                this.showOthers && !e._embedded.streams[r].channel.hidden && "true" !== e._embedded.streams[r].channel.premium && (n = !0),
                !0) {
                case !n:
                case !this.filterAdult && e._embedded.streams[r].channel.adult:
                case this.fiterTwitch && "twitch" === e._embedded.streams[r].channel.player_type.toLowerCase():
                    continue
                }
                t = i.replace(/!!user_count!!/gi, e._embedded.streams[r].player_viewers).replace(/!!name!!/gi, e._embedded.streams[r].channel.key).replace(/!!desc!!/gi, e._embedded.streams[r].channel.title).replace(/!!id!!/gi, e._embedded.streams[r].channel.id).replace(/!!thumb!!/gi, e._embedded.streams[r].channel.thumb).replace(/!!hidden!!/gi, e._embedded.streams[r].channel.hidden ? "hidden" : "").replace(/!!premium!!/gi, "true" === e._embedded.streams[r].channel.premium ? "premium" : "").replace(/!!adult!!/gi, e._embedded.streams[r].channel.adult ? "adult" : "").replace(/!!player!!/gi, e._embedded.streams[r].channel.player_type.toLowerCase()).replace(/!![A-Za-z_\.]*!!/gi, ""),
                s += t
            }
            var o = document.createElement("span");
            o.innerHTML = s,
            this.dom.streams_list.appendChild(o),
            this.checkScrool()
        }
    }
    ,
    n.prototype.getPage = function(t) {
        if (this.isLoading || !this.enabled)
            return !1;
        var i = this
          , n = {
            page: t || 1
        };
        return n.hidden = "true",
        e.GgApi.getStreams(n, function(e) {
            i.setLoaded(),
            i.onLoaded(e)
        }),
        this.setLoading(),
        !0
    }
    ,
    n.prototype.setLoading = function() {
        this.isLoading = !0,
        this.dom.streams_list.className = "loading"
    }
    ,
    n.prototype.setLoaded = function() {
        this.isLoading = !1,
        this.dom.streams_list.className = ""
    }
    ,
    n.prototype.nextPage = function() {
        var e = this.loadedPage + 1;
        if (!(this.page_count != -1 && this.page_count < e))
            return !!this.getPage(e) && void (this.loadedPage = e)
    }
    ,
    n.prototype.checkScrool = function() {
        if (!e.location.hash || "#" === e.location.hash) {
            var t = this.dom.streams_list.clientHeight
              , i = e.pageYOffset + e.innerHeight;
            i > t - 400 && this.nextPage()
        }
    }
    ,
    n.prototype.filterSwitch = function(e, t) {
        this[e] = "undefined" != typeof t ? t : !this[e],
        this.saveFilters(),
        this.reset()
    }
    ,
    n.prototype.saveFilters = function() {
        document.cookie = "hidden=" + (this.showHidden ? "1" : "0") + ";",
        document.cookie = "others=" + (this.showOthers ? "1" : "0") + ";",
        document.cookie = "premium=" + (this.showPremium ? "1" : "0") + ";",
        document.cookie = "adult=" + (this.filterAdult ? "1" : "0") + ";",
        document.cookie = "twitch=" + (this.fiterTwitch ? "1" : "0") + ";",
        console.log(document.cookie)
    }
    ,
    e.l = new n
}(window);
