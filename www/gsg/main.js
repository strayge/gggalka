"use strict";

class Api {
    constructor() {
        this.queue = []
        this.baseUrl = "https://goodgame.ru/api/4/"
    }

    getStreams(params, success_cb, error_cb) {
        this._request("streams", params, success_cb, error_cb)
    }

    getFavorites(params, success_cb, error_cb) {
        this._request("favorites2", params, success_cb, error_cb)
    }

    getStream(stream_id, success_cb, error_cb) {
        this._request("streams/" + stream_id, {}, success_cb, error_cb)
    }

    _reformat_params(e) {
        var t = "";
        for (var i in e)
            e.hasOwnProperty(i) && (t += (t ? "&" : "") + i + "=" + e[i]);
        return t
    }

    _request(endpoint, params, success_cb, error_cb, retries = 0) {
        if (retries++ > 2)
            return error_cb();
        var local_this = this;
        var retry = function() {
            local_this._request(endpoint, params, success_cb, error_cb, retries)
        }

        var request = new XMLHttpRequest;
        error_cb = error_cb || function() {};
        request.open("GET", this.baseUrl + endpoint + "?" + this._reformat_params(params), true);
        request.onreadystatechange = function() {
            if (4 == this.readyState) {
                if (0 === this.status && "" === this.responseText)
                    return setTimeout(retry, 1000);
                try {
                    success_cb(JSON.parse(this.responseText))
                } catch (e) {
                    console.error(e);
                    error_cb(this.responseText);
                }
            }
        };
        request.onerror = function() {setTimeout(retry, 1000)};
        request.onabort = function() {setTimeout(retry, 1000)};
        request.send();
    }

    getHiddenStreams(success_cb, error_cb) {
        fetch("https://ggstats.strayge.com/hidden").then(response => response.json()).then(response => {
            for (var i = 0; i < response.streams.length; i++) {
                var username = response.streams[i].username;
                fetch("https://goodgame.ru/api/4/users/" + username).then(response => response.json()).then(response => {
                    success_cb(response);
                })
            }
            console.log(response);
        })
    }
}

class Router {
    constructor() {
        this.events = {
            channel: [],
            list: []
        },
        window.addEventListener("hashchange", this._checkState.bind(this));
        document.addEventListener("keydown", function(e) {
            var t = e.keyCode;
            27 == t && (window.location.hash = "#")
        }, false);
        this._checkState();
    }

    _currentState(e) {
        return e ? e === this._currentState() : window.location.hash && "#" !== window.location.hash ? "channel" : "list"
    }

    _checkState() {
        this._trigger(this._currentState(), window.location.hash.slice(1))
    }

    _trigger(e, t) {
        for (var i in this.events)
            for (var n in this.events[i])
                this.events[i][n][i === e ? "start" : "stop"](t)
    }

    goList() {
        this._trigger("list", "#")
    }

    onChannel(e, t) {
        var i = function() {}
          , n = {
            start: e || i,
            stop: t || i
        };
        this.events.channel.push(n),
        n[this._currentState("channel") ? "start" : "stop"](window.location.hash && window.location.hash.slice(1))
    }

    onList(e, t) {
        var i = function() {}
          , n = {
            start: e || i,
            stop: t || i
        };
        this.events.list.push(n),
        n[this._currentState("list") ? "start" : "stop"](window.location.hash && window.location.hash.slice(1))
    }
}

class View {
    constructor() {
        this.enabled = false;
        this.splitted = false;
        this.dom = {
            player: document.getElementById("player"),
            chat_inner: document.getElementById("chat_inner"),
            player_content: document.getElementById("player_content")
        };
        this.init();
    }

    splitInit() {
        this.splitted || (Split(["#player", "#chat"], {
            sizes: [75, 25],
            minSize: 100,
            gutterSize: 5
        }),
        this.splitted = true)
    }

    createView(id, t) {
        console.log('id ' + id)
        this.getStream(id),
        this.id = id
    }

    disableView() {
        this.enabled && (this.dom.player.innerHTML = "",
        this.dom.chat_inner.innerHTML = "",
        this.dom.player_content.style.display = "none",
        this.enabled = false)
    }

    init() {
        window.Router.onChannel(this.createView.bind(this), this.disableView.bind(this))
    }

    getStream(stream_id) {
        var local_this = this;
        return window.GgApi.getStream(
            stream_id,
            function(response) {local_this.onLoaded(response)},
            function() {window.Router.goList()},
        )
    }

    onLoaded(response) {
        if (!response)
            return void (window.location.hash = "#");
        var t = response.preview;
        var html = "<iframe frameborder=\"0\" width=\"100%\" height=\"100%\" src=\"https://goodgame.ru/player?!!streamkey!!\"></iframe>";
        t = html.replace("<iframe ", '<iframe allowfullscreen="allowfullscreen"')
                .replace("!!streamkey!!", response.streamKey);
        this.dom.player.innerHTML = t;
        this.dom.chat_inner.innerHTML = '<iframe frameborder="0" allowfullscreen="allowfullscreen" width="100%" height="100%" src="https://goodgame.ru/chat/' + response.id + '/"></iframe>';
        this.dom.player_content.style.display = "block";
        this.enabled = true;
        this.splitInit()
    }
}

class List {
    constructor() {
        var read_from_cookie = function(name) {
            for (var t = name + "=", i = decodeURIComponent(document.cookie), n = i.split(";"), s = 0; s < n.length; s++) {
                for (var r = n[s]; " " == r.charAt(0); )
                    r = r.substring(1);
                if (0 == r.indexOf(t))
                    return "1" === r.substring(t.length, r.length)
            }
            return true
        }

        this.showHidden = read_from_cookie("hidden");
        this.showOthers = read_from_cookie("other");
        this.showPremium = read_from_cookie("premium");
        this.filterAdult = read_from_cookie("adult");
        this.fiterTwitch = read_from_cookie("twitch");
        this.enabled = true;
        this.loadedPage = 0;
        this.page_count = -1;
        window.addEventListener("load", this.init.bind(this));
    }

    init() {
        var local_this = this;
        this.dom = {
            streams_list: document.querySelector("#streams_list")
        };
        var toggles = ["showHidden", "showOthers", "showPremium", "filterAdult", "fiterTwitch "];
        for (var i in toggles) {
            var element = document.getElementById(toggles[i]);
            if (element) {
                element.checked = local_this[toggles[i]];
                element.addEventListener(
                    "change",
                    function(n) {
                        local_this.filterSwitch(toggles[i], n.target.checked)
                    }
                )
            }
        }
        document.addEventListener("scroll", this.checkScroll.bind(this));

        window.Router.onList(this.enable.bind(this), this.disable.bind(this));

        this.checkScroll();
    }

    reset() {
        this.loadedPage = 0;
        this.page_count = -1;
        this.dom.streams_list.innerHTML = "";
        this.nextPage();
    }

    enable() {
        this.enabled = true;
        this.dom.streams_list.style.display = "block";
        this.checkScroll();
    }

    disable() {
        this.enabled = false;
        clearInterval(this.scrollTimer);
        this.dom.streams_list.style.display = "none";
    }

    onLoaded(response, single = false) {
        if (!response) return;
        
        if (!single) {
            var streams = response.streams;
            this.page_count = Math.floor(response.queryInfo.qty / response.queryInfo.onPage);
        } else {
            var streams = [response.stream];
            this.page_count = 0;
        }
    
        var streamHtml = "";
        for (var i in streams) {
            var stream = streams[i];
            var adult = !stream.adult;
            var hidden = !stream.hidden;
            var premium = !!stream.premiums;
            var player = "gg";

            var other = !hidden && !premium;
            var show = (this.showHidden && hidden) || (this.showPremium && premium) || (this.showOthers && other);
            show = show && !(!this.filterAdult && adult);
            show = show && !(this.fiterTwitch && player !== "twitch");
            if (!show) {
                continue
            }

            var html = '<a class="stream-item !!hidden!! !!premium!! !!adult!! !!player!! " href="#!!id!!"> <div class="inner"><span class="viewers"><span class="icon-users"></span> &#128100; !!user_count!! </span> <span class="stream-info"><span class="name">!!name!!</span><span class="stream">!!desc!!</span></span><img class="preview" src="!!thumb!!" onerror="this.src=\'https://goodgame.ru/images/ico_tv.png\'"></div></a>';
            var temp_html = html.replace(/!!user_count!!/gi, stream.viewers)
                                .replace(/!!name!!/gi, stream.key)
                                .replace(/!!desc!!/gi, stream.title)
                                .replace(/!!id!!/gi, stream.key)
                                .replace(/!!thumb!!/gi, stream.preview)
                                .replace(/!!hidden!!/gi, hidden ? "hidden" : "")
                                .replace(/!!premium!!/gi, "true" === premium ? "premium" : "")
                                .replace(/!!adult!!/gi, adult ? "adult" : "")
                                .replace(/!!player!!/gi, player)
                                .replace(/!![A-Za-z_\.]*!!/gi, "")
            streamHtml += temp_html;
        }
        var steamElement = document.createElement("span");
        steamElement.innerHTML = streamHtml;
        this.dom.streams_list.appendChild(steamElement);
        this.checkScroll();
    }

    getPage(page) {
        var local_this = this;
        if (this.isLoading || !this.enabled)
            return false;

        if (this.showHidden) {
            this.setLoading();
            window.GgApi.getHiddenStreams(function(response) {
                local_this.onLoaded(response, true);
                local_this.setLoaded();
            })
            return true;
        }

        var params = {
            page: page || 1
        };
        // params.hidden = "true";
        this.setLoading();
        window.GgApi.getStreams(params, function(response) {
            local_this.onLoaded(response);
            local_this.setLoaded();
            local_this.checkScroll();
        })
        return true;
    }

    setLoading() {
        this.isLoading = true;
        this.dom.streams_list.className = "loading";
    }

    setLoaded() {
        this.isLoading = false;
        this.dom.streams_list.className = "";
    }

    nextPage() {
        if (this.isLoading || !this.enabled)
            return false;
        var page = this.loadedPage + 1;
        console.log("nextPage: " + page + " Total: " + this.page_count)
        if (!(this.page_count != -1 && this.page_count < page)) {
            if (this.getPage(page)) {
                this.loadedPage = page
            }
        }
    }

    checkScroll() {
        if (!window.location.hash || "#" === window.location.hash) {
            var screen_bottom_pos = window.pageYOffset + window.innerHeight;
            var list_height = this.dom.streams_list.clientHeight;
            if ( screen_bottom_pos > list_height) {
                this.nextPage();
            }
        }
    }

    filterSwitch(e, t) {
        this[e] = "undefined" != typeof t ? t : !this[e],
        this.saveFilters(),
        this.reset()
    }

    saveFilters() {
        document.cookie = "hidden=" + (this.showHidden ? "1" : "0") + ";",
        document.cookie = "others=" + (this.showOthers ? "1" : "0") + ";",
        document.cookie = "premium=" + (this.showPremium ? "1" : "0") + ";",
        document.cookie = "adult=" + (this.filterAdult ? "1" : "0") + ";",
        document.cookie = "twitch=" + (this.fiterTwitch ? "1" : "0") + ";",
        console.log(document.cookie)
    }
}

window.Router = new Router();
window.GgApi = new Api();
window.l = new List();
new View();

/*! Split.js - v1.6.5 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Split=t()}(this,(function(){"use strict";var e="undefined"!=typeof window?window:null,t=null===e,n=t?void 0:e.document,i=function(){return!1},r=t?"calc":["","-webkit-","-moz-","-o-"].filter((function(e){var t=n.createElement("div");return t.style.cssText="width:"+e+"calc(9px)",!!t.style.length})).shift()+"calc",s=function(e){return"string"==typeof e||e instanceof String},o=function(e){if(s(e)){var t=n.querySelector(e);if(!t)throw new Error("Selector "+e+" did not match a DOM element");return t}return e},a=function(e,t,n){var i=e[t];return void 0!==i?i:n},u=function(e,t,n,i){if(t){if("end"===i)return 0;if("center"===i)return e/2}else if(n){if("start"===i)return 0;if("center"===i)return e/2}return e},l=function(e,t){var i=n.createElement("div");return i.className="gutter gutter-"+t,i},c=function(e,t,n){var i={};return s(t)?i[e]=t:i[e]=r+"("+t+"% - "+n+"px)",i},h=function(e,t){var n;return(n={})[e]=t+"px",n};return function(r,s){if(void 0===s&&(s={}),t)return{};var f,d,v,m,g,p,y=r;Array.from&&(y=Array.from(y));var z=o(y[0]).parentNode,S=getComputedStyle?getComputedStyle(z):null,b=S?S.flexDirection:null,E=a(s,"sizes")||y.map((function(){return 100/y.length})),_=a(s,"minSize",100),L=Array.isArray(_)?_:y.map((function(){return _})),w=a(s,"maxSize",1/0),x=Array.isArray(w)?w:y.map((function(){return w})),O=a(s,"expandToMin",!1),A=a(s,"gutterSize",10),k=a(s,"gutterAlign","center"),C=a(s,"snapOffset",30),M=Array.isArray(C)?C:y.map((function(){return C})),U=a(s,"dragInterval",1),D=a(s,"direction","horizontal"),B=a(s,"cursor","horizontal"===D?"col-resize":"row-resize"),T=a(s,"gutter",l),j=a(s,"elementStyle",c),F=a(s,"gutterStyle",h);function R(e,t,n,i){var r=j(f,t,n,i);Object.keys(r).forEach((function(t){e.style[t]=r[t]}))}function N(){return p.map((function(e){return e.size}))}function q(e){return"touches"in e?e.touches[0][d]:e[d]}function H(e){var t=p[this.a],n=p[this.b],i=t.size+n.size;t.size=e/this.size*i,n.size=i-e/this.size*i,R(t.element,t.size,this._b,t.i),R(n.element,n.size,this._c,n.i)}function I(e){var t,n=p[this.a],r=p[this.b];this.dragging&&(t=q(e)-this.start+(this._b-this.dragOffset),U>1&&(t=Math.round(t/U)*U),t<=n.minSize+n.snapOffset+this._b?t=n.minSize+this._b:t>=this.size-(r.minSize+r.snapOffset+this._c)&&(t=this.size-(r.minSize+this._c)),t>=n.maxSize-n.snapOffset+this._b?t=n.maxSize+this._b:t<=this.size-(r.maxSize-r.snapOffset+this._c)&&(t=this.size-(r.maxSize+this._c)),H.call(this,t),a(s,"onDrag",i)(N()))}function W(){var e=p[this.a].element,t=p[this.b].element,n=e.getBoundingClientRect(),i=t.getBoundingClientRect();this.size=n[f]+i[f]+this._b+this._c,this.start=n[v],this.end=n[m]}function X(e){var t=function(e){if(!getComputedStyle)return null;var t=getComputedStyle(e);if(!t)return null;var n=e[g];return 0===n?null:n-="horizontal"===D?parseFloat(t.paddingLeft)+parseFloat(t.paddingRight):parseFloat(t.paddingTop)+parseFloat(t.paddingBottom)}(z);if(null===t)return e;if(L.reduce((function(e,t){return e+t}),0)>t)return e;var n=0,i=[],r=e.map((function(r,s){var o=t*r/100,a=u(A,0===s,s===e.length-1,k),l=L[s]+a;return o<l?(n+=l-o,i.push(0),l):(i.push(o-l),o)}));return 0===n?e:r.map((function(e,r){var s=e;if(n>0&&i[r]-n>0){var o=Math.min(n,i[r]-n);n-=o,s=e-o}return s/t*100}))}function Y(){var t=p[this.a].element,r=p[this.b].element;this.dragging&&a(s,"onDragEnd",i)(N()),this.dragging=!1,e.removeEventListener("mouseup",this.stop),e.removeEventListener("touchend",this.stop),e.removeEventListener("touchcancel",this.stop),e.removeEventListener("mousemove",this.move),e.removeEventListener("touchmove",this.move),this.stop=null,this.move=null,t.removeEventListener("selectstart",i),t.removeEventListener("dragstart",i),r.removeEventListener("selectstart",i),r.removeEventListener("dragstart",i),t.style.userSelect="",t.style.webkitUserSelect="",t.style.MozUserSelect="",t.style.pointerEvents="",r.style.userSelect="",r.style.webkitUserSelect="",r.style.MozUserSelect="",r.style.pointerEvents="",this.gutter.style.cursor="",this.parent.style.cursor="",n.body.style.cursor=""}function G(t){if(!("button"in t)||0===t.button){var r=p[this.a].element,o=p[this.b].element;this.dragging||a(s,"onDragStart",i)(N()),t.preventDefault(),this.dragging=!0,this.move=I.bind(this),this.stop=Y.bind(this),e.addEventListener("mouseup",this.stop),e.addEventListener("touchend",this.stop),e.addEventListener("touchcancel",this.stop),e.addEventListener("mousemove",this.move),e.addEventListener("touchmove",this.move),r.addEventListener("selectstart",i),r.addEventListener("dragstart",i),o.addEventListener("selectstart",i),o.addEventListener("dragstart",i),r.style.userSelect="none",r.style.webkitUserSelect="none",r.style.MozUserSelect="none",r.style.pointerEvents="none",o.style.userSelect="none",o.style.webkitUserSelect="none",o.style.MozUserSelect="none",o.style.pointerEvents="none",this.gutter.style.cursor=B,this.parent.style.cursor=B,n.body.style.cursor=B,W.call(this),this.dragOffset=q(t)-this.end}}"horizontal"===D?(f="width",d="clientX",v="left",m="right",g="clientWidth"):"vertical"===D&&(f="height",d="clientY",v="top",m="bottom",g="clientHeight"),E=X(E);var J=[];function K(e){var t=e.i===J.length,n=t?J[e.i-1]:J[e.i];W.call(n);var i=t?n.size-e.minSize-n._c:e.minSize+n._b;H.call(n,i)}return(p=y.map((function(e,t){var n,i={element:o(e),size:E[t],minSize:L[t],maxSize:x[t],snapOffset:M[t],i:t};if(t>0&&((n={a:t-1,b:t,dragging:!1,direction:D,parent:z})._b=u(A,t-1==0,!1,k),n._c=u(A,!1,t===y.length-1,k),"row-reverse"===b||"column-reverse"===b)){var r=n.a;n.a=n.b,n.b=r}if(t>0){var s=T(t,D,i.element);!function(e,t,n){var i=F(f,t,n);Object.keys(i).forEach((function(t){e.style[t]=i[t]}))}(s,A,t),n._a=G.bind(n),s.addEventListener("mousedown",n._a),s.addEventListener("touchstart",n._a),z.insertBefore(s,i.element),n.gutter=s}return R(i.element,i.size,u(A,0===t,t===y.length-1,k),t),t>0&&J.push(n),i}))).forEach((function(e){var t=e.element.getBoundingClientRect()[f];t<e.minSize&&(O?K(e):e.minSize=t)})),{setSizes:function(e){var t=X(e);t.forEach((function(e,n){if(n>0){var i=J[n-1],r=p[i.a],s=p[i.b];r.size=t[n-1],s.size=e,R(r.element,r.size,i._b,r.i),R(s.element,s.size,i._c,s.i)}}))},getSizes:N,collapse:function(e){K(p[e])},destroy:function(e,t){J.forEach((function(n){if(!0!==t?n.parent.removeChild(n.gutter):(n.gutter.removeEventListener("mousedown",n._a),n.gutter.removeEventListener("touchstart",n._a)),!0!==e){var i=j(f,n.a.size,n._b);Object.keys(i).forEach((function(e){p[n.a].element.style[e]="",p[n.b].element.style[e]=""}))}}))},parent:z,pairs:J}}}));
