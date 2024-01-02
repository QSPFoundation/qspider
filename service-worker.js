try {
  self["workbox:core:7.0.0"] && _();
} catch {
}
const dr = (t, ...e) => {
  let n = t;
  return e.length > 0 && (n += ` :: ${JSON.stringify(e)}`), n;
}, fr = dr;
class ye extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, n) {
    const r = fr(e, n);
    super(r), this.name = e, this.details = n;
  }
}
const pr = /* @__PURE__ */ new Set(), X = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, St = (t) => [X.prefix, t, X.suffix].filter((e) => e && e.length > 0).join("-"), mr = (t) => {
  for (const e of Object.keys(X))
    t(e);
}, yr = {
  updateDetails: (t) => {
    mr((e) => {
      typeof t[e] == "string" && (X[e] = t[e]);
    });
  },
  getGoogleAnalyticsName: (t) => t || St(X.googleAnalytics),
  getPrecacheName: (t) => t || St(X.precache),
  getPrefix: () => X.prefix,
  getRuntimeName: (t) => t || St(X.runtime),
  getSuffix: () => X.suffix
};
function gn(t, e) {
  const n = new URL(t);
  for (const r of e)
    n.searchParams.delete(r);
  return n.href;
}
async function gr(t, e, n, r) {
  const s = gn(e.url, n);
  if (e.url === s)
    return t.match(e, r);
  const a = Object.assign(Object.assign({}, r), { ignoreSearch: !0 }), i = await t.keys(e, a);
  for (const o of i) {
    const c = gn(o.url, n);
    if (s === c)
      return t.match(o, r);
  }
}
class br {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, n) => {
      this.resolve = e, this.reject = n;
    });
  }
}
async function vr() {
  for (const t of pr)
    await t();
}
const wr = (t) => new URL(String(t), location.href).href.replace(new RegExp(`^${location.origin}`), "");
function An(t) {
  return new Promise((e) => setTimeout(e, t));
}
function _r() {
  self.addEventListener("activate", () => self.clients.claim());
}
const j = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, I = Object.keys, F = Array.isArray;
function $(t, e) {
  return typeof e != "object" || I(e).forEach(function(n) {
    t[n] = e[n];
  }), t;
}
typeof Promise > "u" || j.Promise || (j.Promise = Promise);
const Le = Object.getPrototypeOf, kr = {}.hasOwnProperty;
function V(t, e) {
  return kr.call(t, e);
}
function Re(t, e) {
  typeof e == "function" && (e = e(Le(t))), (typeof Reflect > "u" ? I : Reflect.ownKeys)(e).forEach((n) => {
    te(t, n, e[n]);
  });
}
const jn = Object.defineProperty;
function te(t, e, n, r) {
  jn(t, e, $(n && V(n, "get") && typeof n.get == "function" ? { get: n.get, set: n.set, configurable: !0 } : { value: n, configurable: !0, writable: !0 }, r));
}
function Se(t) {
  return { from: function(e) {
    return t.prototype = Object.create(e.prototype), te(t.prototype, "constructor", t), { extend: Re.bind(null, t.prototype) };
  } };
}
const xr = Object.getOwnPropertyDescriptor;
function sn(t, e) {
  let n;
  return xr(t, e) || (n = Le(t)) && sn(n, e);
}
const Er = [].slice;
function ft(t, e, n) {
  return Er.call(t, e, n);
}
function Dn(t, e) {
  return e(t);
}
function Te(t) {
  if (!t)
    throw new Error("Assertion Failed");
}
function Tn(t) {
  j.setImmediate ? setImmediate(t) : setTimeout(t, 0);
}
function Bn(t, e) {
  return t.reduce((n, r, s) => {
    var a = e(r, s);
    return a && (n[a[0]] = a[1]), n;
  }, {});
}
function ne(t, e) {
  if (V(t, e))
    return t[e];
  if (!e)
    return t;
  if (typeof e != "string") {
    for (var n = [], r = 0, s = e.length; r < s; ++r) {
      var a = ne(t, e[r]);
      n.push(a);
    }
    return n;
  }
  var i = e.indexOf(".");
  if (i !== -1) {
    var o = t[e.substr(0, i)];
    return o === void 0 ? void 0 : ne(o, e.substr(i + 1));
  }
}
function G(t, e, n) {
  if (t && e !== void 0 && (!("isFrozen" in Object) || !Object.isFrozen(t)))
    if (typeof e != "string" && "length" in e) {
      Te(typeof n != "string" && "length" in n);
      for (var r = 0, s = e.length; r < s; ++r)
        G(t, e[r], n[r]);
    } else {
      var a = e.indexOf(".");
      if (a !== -1) {
        var i = e.substr(0, a), o = e.substr(a + 1);
        if (o === "")
          n === void 0 ? F(t) && !isNaN(parseInt(i)) ? t.splice(i, 1) : delete t[i] : t[i] = n;
        else {
          var c = t[i];
          c && V(t, i) || (c = t[i] = {}), G(c, o, n);
        }
      } else
        n === void 0 ? F(t) && !isNaN(parseInt(e)) ? t.splice(e, 1) : delete t[e] : t[e] = n;
    }
}
function In(t) {
  var e = {};
  for (var n in t)
    V(t, n) && (e[n] = t[n]);
  return e;
}
const Sr = [].concat;
function Mn(t) {
  return Sr.apply([], t);
}
const Nn = "Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(Mn([8, 16, 32, 64].map((t) => ["Int", "Uint", "Float"].map((e) => e + t + "Array")))).filter((t) => j[t]), Cr = Nn.map((t) => j[t]);
Bn(Nn, (t) => [t, !0]);
let ae = null;
function Ye(t) {
  ae = typeof WeakMap < "u" && /* @__PURE__ */ new WeakMap();
  const e = Dt(t);
  return ae = null, e;
}
function Dt(t) {
  if (!t || typeof t != "object")
    return t;
  let e = ae && ae.get(t);
  if (e)
    return e;
  if (F(t)) {
    e = [], ae && ae.set(t, e);
    for (var n = 0, r = t.length; n < r; ++n)
      e.push(Dt(t[n]));
  } else if (Cr.indexOf(t.constructor) >= 0)
    e = t;
  else {
    const a = Le(t);
    for (var s in e = a === Object.prototype ? {} : Object.create(a), ae && ae.set(t, e), t)
      V(t, s) && (e[s] = Dt(t[s]));
  }
  return e;
}
const { toString: Pr } = {};
function Tt(t) {
  return Pr.call(t).slice(8, -1);
}
const Bt = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", Rr = typeof Bt == "symbol" ? function(t) {
  var e;
  return t != null && (e = t[Bt]) && e.apply(t);
} : function() {
  return null;
}, Ee = {};
function Z(t) {
  var e, n, r, s;
  if (arguments.length === 1) {
    if (F(t))
      return t.slice();
    if (this === Ee && typeof t == "string")
      return [t];
    if (s = Rr(t)) {
      for (n = []; !(r = s.next()).done; )
        n.push(r.value);
      return n;
    }
    if (t == null)
      return [t];
    if (typeof (e = t.length) == "number") {
      for (n = new Array(e); e--; )
        n[e] = t[e];
      return n;
    }
    return [t];
  }
  for (e = arguments.length, n = new Array(e); e--; )
    n[e] = arguments[e];
  return n;
}
const an = typeof Symbol < "u" ? (t) => t[Symbol.toStringTag] === "AsyncFunction" : () => !1;
var Y = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function qn(t, e) {
  Y = t, Fn = e;
}
var Fn = () => !0;
const Kr = !new Error("").stack;
function ve() {
  if (Kr)
    try {
      throw ve.arguments, new Error();
    } catch (t) {
      return t;
    }
  return new Error();
}
function It(t, e) {
  var n = t.stack;
  return n ? (e = e || 0, n.indexOf(t.name) === 0 && (e += (t.name + t.message).split(`
`).length), n.split(`
`).slice(e).filter(Fn).map((r) => `
` + r).join("")) : "";
}
var Un = ["Unknown", "Constraint", "Data", "TransactionInactive", "ReadOnly", "Version", "NotFound", "InvalidState", "InvalidAccess", "Abort", "Timeout", "QuotaExceeded", "Syntax", "DataClone"], on = ["Modify", "Bulk", "OpenFailed", "VersionChange", "Schema", "Upgrade", "InvalidTable", "MissingAPI", "NoSuchDatabase", "InvalidArgument", "SubTransaction", "Unsupported", "Internal", "DatabaseClosed", "PrematureCommit", "ForeignAwait"].concat(Un), Or = { VersionChanged: "Database version changed by other database connection", DatabaseClosed: "Database has been closed", Abort: "Transaction aborted", TransactionInactive: "Transaction has already completed or failed", MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb" };
function Ce(t, e) {
  this._e = ve(), this.name = t, this.message = e;
}
function Ln(t, e) {
  return t + ". Errors: " + Object.keys(e).map((n) => e[n].toString()).filter((n, r, s) => s.indexOf(n) === r).join(`
`);
}
function pt(t, e, n, r) {
  this._e = ve(), this.failures = e, this.failedKeys = r, this.successCount = n, this.message = Ln(t, e);
}
function Ie(t, e) {
  this._e = ve(), this.name = "BulkError", this.failures = Object.keys(e).map((n) => e[n]), this.failuresByPos = e, this.message = Ln(t, e);
}
Se(Ce).from(Error).extend({ stack: { get: function() {
  return this._stack || (this._stack = this.name + ": " + this.message + It(this._e, 2));
} }, toString: function() {
  return this.name + ": " + this.message;
} }), Se(pt).from(Ce), Se(Ie).from(Ce);
var cn = on.reduce((t, e) => (t[e] = e + "Error", t), {});
const Ar = Ce;
var R = on.reduce((t, e) => {
  var n = e + "Error";
  function r(s, a) {
    this._e = ve(), this.name = n, s ? typeof s == "string" ? (this.message = `${s}${a ? `
 ` + a : ""}`, this.inner = a || null) : typeof s == "object" && (this.message = `${s.name} ${s.message}`, this.inner = s) : (this.message = Or[e] || n, this.inner = null);
  }
  return Se(r).from(Ar), t[e] = r, t;
}, {});
R.Syntax = SyntaxError, R.Type = TypeError, R.Range = RangeError;
var bn = Un.reduce((t, e) => (t[e + "Error"] = R[e], t), {}), it = on.reduce((t, e) => (["Syntax", "Type", "Range"].indexOf(e) === -1 && (t[e + "Error"] = R[e]), t), {});
function A() {
}
function $e(t) {
  return t;
}
function jr(t, e) {
  return t == null || t === $e ? e : function(n) {
    return e(t(n));
  };
}
function ge(t, e) {
  return function() {
    t.apply(this, arguments), e.apply(this, arguments);
  };
}
function Dr(t, e) {
  return t === A ? e : function() {
    var n = t.apply(this, arguments);
    n !== void 0 && (arguments[0] = n);
    var r = this.onsuccess, s = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var a = e.apply(this, arguments);
    return r && (this.onsuccess = this.onsuccess ? ge(r, this.onsuccess) : r), s && (this.onerror = this.onerror ? ge(s, this.onerror) : s), a !== void 0 ? a : n;
  };
}
function Tr(t, e) {
  return t === A ? e : function() {
    t.apply(this, arguments);
    var n = this.onsuccess, r = this.onerror;
    this.onsuccess = this.onerror = null, e.apply(this, arguments), n && (this.onsuccess = this.onsuccess ? ge(n, this.onsuccess) : n), r && (this.onerror = this.onerror ? ge(r, this.onerror) : r);
  };
}
function Br(t, e) {
  return t === A ? e : function(n) {
    var r = t.apply(this, arguments);
    $(n, r);
    var s = this.onsuccess, a = this.onerror;
    this.onsuccess = null, this.onerror = null;
    var i = e.apply(this, arguments);
    return s && (this.onsuccess = this.onsuccess ? ge(s, this.onsuccess) : s), a && (this.onerror = this.onerror ? ge(a, this.onerror) : a), r === void 0 ? i === void 0 ? void 0 : i : $(r, i);
  };
}
function Ir(t, e) {
  return t === A ? e : function() {
    return e.apply(this, arguments) !== !1 && t.apply(this, arguments);
  };
}
function ln(t, e) {
  return t === A ? e : function() {
    var n = t.apply(this, arguments);
    if (n && typeof n.then == "function") {
      for (var r = this, s = arguments.length, a = new Array(s); s--; )
        a[s] = arguments[s];
      return n.then(function() {
        return e.apply(r, a);
      });
    }
    return e.apply(this, arguments);
  };
}
it.ModifyError = pt, it.DexieError = Ce, it.BulkError = Ie;
var We = {};
const $n = 100, [Mt, mt, Nt] = typeof Promise > "u" ? [] : (() => {
  let t = Promise.resolve();
  if (typeof crypto > "u" || !crypto.subtle)
    return [t, Le(t), t];
  const e = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [e, Le(e), t];
})(), Wn = mt && mt.then, ot = Mt && Mt.constructor, un = !!Nt;
var qt = !1, Mr = Nt ? () => {
  Nt.then(Je);
} : j.setImmediate ? setImmediate.bind(null, Je) : j.MutationObserver ? () => {
  var t = document.createElement("div");
  new MutationObserver(() => {
    Je(), t = null;
  }).observe(t, { attributes: !0 }), t.setAttribute("i", "1");
} : () => {
  setTimeout(Je, 0);
}, Me = function(t, e) {
  Be.push([t, e]), yt && (Mr(), yt = !1);
}, Ft = !0, yt = !0, fe = [], ct = [], Ut = null, Lt = $e, Pe = { id: "global", global: !0, ref: 0, unhandleds: [], onunhandled: _n, pgp: !1, env: {}, finalize: function() {
  this.unhandleds.forEach((t) => {
    try {
      _n(t[0], t[1]);
    } catch {
    }
  });
} }, P = Pe, Be = [], pe = 0, lt = [];
function S(t) {
  if (typeof this != "object")
    throw new TypeError("Promises must be constructed via new");
  this._listeners = [], this.onuncatched = A, this._lib = !1;
  var e = this._PSD = P;
  if (Y && (this._stackHolder = ve(), this._prev = null, this._numPrev = 0), typeof t != "function") {
    if (t !== We)
      throw new TypeError("Not a function");
    return this._state = arguments[1], this._value = arguments[2], void (this._state === !1 && Wt(this, this._value));
  }
  this._state = null, this._value = null, ++e.ref, Vn(this, t);
}
const $t = { get: function() {
  var t = P, e = gt;
  function n(r, s) {
    var a = !t.global && (t !== P || e !== gt);
    const i = a && !re();
    var o = new S((c, d) => {
      hn(this, new Hn(bt(r, t, a, i), bt(s, t, a, i), c, d, t));
    });
    return Y && Yn(o, this), o;
  }
  return n.prototype = We, n;
}, set: function(t) {
  te(this, "then", t && t.prototype === We ? $t : { get: function() {
    return t;
  }, set: $t.set });
} };
function Hn(t, e, n, r, s) {
  this.onFulfilled = typeof t == "function" ? t : null, this.onRejected = typeof e == "function" ? e : null, this.resolve = n, this.reject = r, this.psd = s;
}
function Vn(t, e) {
  try {
    e((n) => {
      if (t._state === null) {
        if (n === t)
          throw new TypeError("A promise cannot be resolved with itself.");
        var r = t._lib && Qe();
        n && typeof n.then == "function" ? Vn(t, (s, a) => {
          n instanceof S ? n._then(s, a) : n.then(s, a);
        }) : (t._state = !0, t._value = n, Gn(t)), r && Xe();
      }
    }, Wt.bind(null, t));
  } catch (n) {
    Wt(t, n);
  }
}
function Wt(t, e) {
  if (ct.push(e), t._state === null) {
    var n = t._lib && Qe();
    e = Lt(e), t._state = !1, t._value = e, Y && e !== null && typeof e == "object" && !e._promise && function(r, s, a) {
      try {
        r.apply(null, a);
      } catch (i) {
        s && s(i);
      }
    }(() => {
      var r = sn(e, "stack");
      e._promise = t, te(e, "stack", { get: () => qt ? r && (r.get ? r.get.apply(e) : r.value) : t.stack });
    }), function(r) {
      fe.some((s) => s._value === r._value) || fe.push(r);
    }(t), Gn(t), n && Xe();
  }
}
function Gn(t) {
  var e = t._listeners;
  t._listeners = [];
  for (var n = 0, r = e.length; n < r; ++n)
    hn(t, e[n]);
  var s = t._PSD;
  --s.ref || s.finalize(), pe === 0 && (++pe, Me(() => {
    --pe == 0 && dn();
  }, []));
}
function hn(t, e) {
  if (t._state !== null) {
    var n = t._state ? e.onFulfilled : e.onRejected;
    if (n === null)
      return (t._state ? e.resolve : e.reject)(t._value);
    ++e.psd.ref, ++pe, Me(Nr, [n, t, e]);
  } else
    t._listeners.push(e);
}
function Nr(t, e, n) {
  try {
    Ut = e;
    var r, s = e._value;
    e._state ? r = t(s) : (ct.length && (ct = []), r = t(s), ct.indexOf(s) === -1 && function(a) {
      for (var i = fe.length; i; )
        if (fe[--i]._value === a._value)
          return void fe.splice(i, 1);
    }(e)), n.resolve(r);
  } catch (a) {
    n.reject(a);
  } finally {
    Ut = null, --pe == 0 && dn(), --n.psd.ref || n.psd.finalize();
  }
}
function zn(t, e, n) {
  if (e.length === n)
    return e;
  var r = "";
  if (t._state === !1) {
    var s, a, i = t._value;
    i != null ? (s = i.name || "Error", a = i.message || i, r = It(i, 0)) : (s = i, a = ""), e.push(s + (a ? ": " + a : "") + r);
  }
  return Y && ((r = It(t._stackHolder, 2)) && e.indexOf(r) === -1 && e.push(r), t._prev && zn(t._prev, e, n)), e;
}
function Yn(t, e) {
  var n = e ? e._numPrev + 1 : 0;
  n < 100 && (t._prev = e, t._numPrev = n);
}
function Je() {
  Qe() && Xe();
}
function Qe() {
  var t = Ft;
  return Ft = !1, yt = !1, t;
}
function Xe() {
  var t, e, n;
  do
    for (; Be.length > 0; )
      for (t = Be, Be = [], n = t.length, e = 0; e < n; ++e) {
        var r = t[e];
        r[0].apply(null, r[1]);
      }
  while (Be.length > 0);
  Ft = !0, yt = !0;
}
function dn() {
  var t = fe;
  fe = [], t.forEach((r) => {
    r._PSD.onunhandled.call(null, r._value, r);
  });
  for (var e = lt.slice(0), n = e.length; n; )
    e[--n]();
}
function Ze(t) {
  return new S(We, !1, t);
}
function D(t, e) {
  var n = P;
  return function() {
    var r = Qe(), s = P;
    try {
      return ce(n, !0), t.apply(this, arguments);
    } catch (a) {
      e && e(a);
    } finally {
      ce(s, !1), r && Xe();
    }
  };
}
Re(S.prototype, { then: $t, _then: function(t, e) {
  hn(this, new Hn(null, null, t, e, P));
}, catch: function(t) {
  if (arguments.length === 1)
    return this.then(null, t);
  var e = arguments[0], n = arguments[1];
  return typeof e == "function" ? this.then(null, (r) => r instanceof e ? n(r) : Ze(r)) : this.then(null, (r) => r && r.name === e ? n(r) : Ze(r));
}, finally: function(t) {
  return this.then((e) => (t(), e), (e) => (t(), Ze(e)));
}, stack: { get: function() {
  if (this._stack)
    return this._stack;
  try {
    qt = !0;
    var t = zn(this, [], 20).join(`
From previous: `);
    return this._state !== null && (this._stack = t), t;
  } finally {
    qt = !1;
  }
} }, timeout: function(t, e) {
  return t < 1 / 0 ? new S((n, r) => {
    var s = setTimeout(() => r(new R.Timeout(e)), t);
    this.then(n, r).finally(clearTimeout.bind(null, s));
  }) : this;
} }), typeof Symbol < "u" && Symbol.toStringTag && te(S.prototype, Symbol.toStringTag, "Dexie.Promise"), Pe.env = Qn(), Re(S, { all: function() {
  var t = Z.apply(null, arguments).map(et);
  return new S(function(e, n) {
    t.length === 0 && e([]);
    var r = t.length;
    t.forEach((s, a) => S.resolve(s).then((i) => {
      t[a] = i, --r || e(t);
    }, n));
  });
}, resolve: (t) => {
  if (t instanceof S)
    return t;
  if (t && typeof t.then == "function")
    return new S((n, r) => {
      t.then(n, r);
    });
  var e = new S(We, !0, t);
  return Yn(e, Ut), e;
}, reject: Ze, race: function() {
  var t = Z.apply(null, arguments).map(et);
  return new S((e, n) => {
    t.map((r) => S.resolve(r).then(e, n));
  });
}, PSD: { get: () => P, set: (t) => P = t }, totalEchoes: { get: () => gt }, newPSD: oe, usePSD: Oe, scheduler: { get: () => Me, set: (t) => {
  Me = t;
} }, rejectionMapper: { get: () => Lt, set: (t) => {
  Lt = t;
} }, follow: (t, e) => new S((n, r) => oe((s, a) => {
  var i = P;
  i.unhandleds = [], i.onunhandled = a, i.finalize = ge(function() {
    (function(o) {
      function c() {
        o(), lt.splice(lt.indexOf(c), 1);
      }
      lt.push(c), ++pe, Me(() => {
        --pe == 0 && dn();
      }, []);
    })(() => {
      this.unhandleds.length === 0 ? s() : a(this.unhandleds[0]);
    });
  }, i.finalize), t();
}, e, n, r)) }), ot && (ot.allSettled && te(S, "allSettled", function() {
  const t = Z.apply(null, arguments).map(et);
  return new S((e) => {
    t.length === 0 && e([]);
    let n = t.length;
    const r = new Array(n);
    t.forEach((s, a) => S.resolve(s).then((i) => r[a] = { status: "fulfilled", value: i }, (i) => r[a] = { status: "rejected", reason: i }).then(() => --n || e(r)));
  });
}), ot.any && typeof AggregateError < "u" && te(S, "any", function() {
  const t = Z.apply(null, arguments).map(et);
  return new S((e, n) => {
    t.length === 0 && n(new AggregateError([]));
    let r = t.length;
    const s = new Array(r);
    t.forEach((a, i) => S.resolve(a).then((o) => e(o), (o) => {
      s[i] = o, --r || n(new AggregateError(s));
    }));
  });
}));
const q = { awaits: 0, echoes: 0, id: 0 };
var qr = 0, ut = [], Ct = 0, gt = 0, Fr = 0;
function oe(t, e, n, r) {
  var s = P, a = Object.create(s);
  a.parent = s, a.ref = 0, a.global = !1, a.id = ++Fr;
  var i = Pe.env;
  a.env = un ? { Promise: S, PromiseProp: { value: S, configurable: !0, writable: !0 }, all: S.all, race: S.race, allSettled: S.allSettled, any: S.any, resolve: S.resolve, reject: S.reject, nthen: vn(i.nthen, a), gthen: vn(i.gthen, a) } : {}, e && $(a, e), ++s.ref, a.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var o = Oe(a, t, n, r);
  return a.ref === 0 && a.finalize(), o;
}
function Ke() {
  return q.id || (q.id = ++qr), ++q.awaits, q.echoes += $n, q.id;
}
function re() {
  return !!q.awaits && (--q.awaits == 0 && (q.id = 0), q.echoes = q.awaits * $n, !0);
}
function et(t) {
  return q.echoes && t && t.constructor === ot ? (Ke(), t.then((e) => (re(), e), (e) => (re(), M(e)))) : t;
}
function Ur(t) {
  ++gt, q.echoes && --q.echoes != 0 || (q.echoes = q.id = 0), ut.push(P), ce(t, !0);
}
function Lr() {
  var t = ut[ut.length - 1];
  ut.pop(), ce(t, !1);
}
function ce(t, e) {
  var n = P;
  if ((e ? !q.echoes || Ct++ && t === P : !Ct || --Ct && t === P) || Xn(e ? Ur.bind(null, t) : Lr), t !== P && (P = t, n === Pe && (Pe.env = Qn()), un)) {
    var r = Pe.env.Promise, s = t.env;
    mt.then = s.nthen, r.prototype.then = s.gthen, (n.global || t.global) && (Object.defineProperty(j, "Promise", s.PromiseProp), r.all = s.all, r.race = s.race, r.resolve = s.resolve, r.reject = s.reject, s.allSettled && (r.allSettled = s.allSettled), s.any && (r.any = s.any));
  }
}
function Qn() {
  var t = j.Promise;
  return un ? { Promise: t, PromiseProp: Object.getOwnPropertyDescriptor(j, "Promise"), all: t.all, race: t.race, allSettled: t.allSettled, any: t.any, resolve: t.resolve, reject: t.reject, nthen: mt.then, gthen: t.prototype.then } : {};
}
function Oe(t, e, n, r, s) {
  var a = P;
  try {
    return ce(t, !0), e(n, r, s);
  } finally {
    ce(a, !1);
  }
}
function Xn(t) {
  Wn.call(Mt, t);
}
function bt(t, e, n, r) {
  return typeof t != "function" ? t : function() {
    var s = P;
    n && Ke(), ce(e, !0);
    try {
      return t.apply(this, arguments);
    } finally {
      ce(s, !1), r && Xn(re);
    }
  };
}
function vn(t, e) {
  return function(n, r) {
    return t.call(this, bt(n, e), bt(r, e));
  };
}
("" + Wn).indexOf("[native code]") === -1 && (Ke = re = A);
const wn = "unhandledrejection";
function _n(t, e) {
  var n;
  try {
    n = e.onuncatched(t);
  } catch {
  }
  if (n !== !1)
    try {
      var r, s = { promise: e, reason: t };
      if (j.document && document.createEvent ? ((r = document.createEvent("Event")).initEvent(wn, !0, !0), $(r, s)) : j.CustomEvent && $(r = new CustomEvent(wn, { detail: s }), s), r && j.dispatchEvent && (dispatchEvent(r), !j.PromiseRejectionEvent && j.onunhandledrejection))
        try {
          j.onunhandledrejection(r);
        } catch {
        }
      Y && r && !r.defaultPrevented && console.warn(`Unhandled rejection: ${t.stack || t}`);
    } catch {
    }
}
var M = S.reject;
function Ht(t, e, n, r) {
  if (t.idbdb && (t._state.openComplete || P.letThrough || t._vip)) {
    var s = t._createTransaction(e, n, t._dbSchema);
    try {
      s.create(), t._state.PR1398_maxLoop = 3;
    } catch (a) {
      return a.name === cn.InvalidState && t.isOpen() && --t._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), t._close(), t.open().then(() => Ht(t, e, n, r))) : M(a);
    }
    return s._promise(e, (a, i) => oe(() => (P.trans = s, r(a, i, s)))).then((a) => s._completion.then(() => a));
  }
  if (t._state.openComplete)
    return M(new R.DatabaseClosed(t._state.dbOpenError));
  if (!t._state.isBeingOpened) {
    if (!t._options.autoOpen)
      return M(new R.DatabaseClosed());
    t.open().catch(A);
  }
  return t._state.dbReadyPromise.then(() => Ht(t, e, n, r));
}
const kn = "3.2.4", de = "￿", Vt = -1 / 0, Q = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", Jn = "String expected.", Ne = [], kt = typeof navigator < "u" && /(MSIE|Trident|Edge)/.test(navigator.userAgent), $r = kt, Wr = kt, Zn = (t) => !/(dexie\.js|dexie\.min\.js)/.test(t), xt = "__dbnames", Pt = "readonly", Rt = "readwrite";
function be(t, e) {
  return t ? e ? function() {
    return t.apply(this, arguments) && e.apply(this, arguments);
  } : t : e;
}
const er = { type: 3, lower: -1 / 0, lowerOpen: !1, upper: [[]], upperOpen: !1 };
function tt(t) {
  return typeof t != "string" || /\./.test(t) ? (e) => e : (e) => (e[t] === void 0 && t in e && delete (e = Ye(e))[t], e);
}
class Hr {
  _trans(e, n, r) {
    const s = this._tx || P.trans, a = this.name;
    function i(c, d, l) {
      if (!l.schema[a])
        throw new R.NotFound("Table " + a + " not part of transaction");
      return n(l.idbtrans, l);
    }
    const o = Qe();
    try {
      return s && s.db === this.db ? s === P.trans ? s._promise(e, i, r) : oe(() => s._promise(e, i, r), { trans: s, transless: P.transless || P }) : Ht(this.db, e, [this.name], i);
    } finally {
      o && Xe();
    }
  }
  get(e, n) {
    return e && e.constructor === Object ? this.where(e).first(n) : this._trans("readonly", (r) => this.core.get({ trans: r, key: e }).then((s) => this.hook.reading.fire(s))).then(n);
  }
  where(e) {
    if (typeof e == "string")
      return new this.db.WhereClause(this, e);
    if (F(e))
      return new this.db.WhereClause(this, `[${e.join("+")}]`);
    const n = I(e);
    if (n.length === 1)
      return this.where(n[0]).equals(e[n[0]]);
    const r = this.schema.indexes.concat(this.schema.primKey).filter((d) => d.compound && n.every((l) => d.keyPath.indexOf(l) >= 0) && d.keyPath.every((l) => n.indexOf(l) >= 0))[0];
    if (r && this.db._maxKey !== de)
      return this.where(r.name).equals(r.keyPath.map((d) => e[d]));
    !r && Y && console.warn(`The query ${JSON.stringify(e)} on ${this.name} would benefit of a compound index [${n.join("+")}]`);
    const { idxByName: s } = this.schema, a = this.db._deps.indexedDB;
    function i(d, l) {
      try {
        return a.cmp(d, l) === 0;
      } catch {
        return !1;
      }
    }
    const [o, c] = n.reduce(([d, l], h) => {
      const u = s[h], m = e[h];
      return [d || u, d || !u ? be(l, u && u.multi ? (g) => {
        const p = ne(g, h);
        return F(p) && p.some((b) => i(m, b));
      } : (g) => i(m, ne(g, h))) : l];
    }, [null, null]);
    return o ? this.where(o.name).equals(e[o.keyPath]).filter(c) : r ? this.filter(c) : this.where(n).equals("");
  }
  filter(e) {
    return this.toCollection().and(e);
  }
  count(e) {
    return this.toCollection().count(e);
  }
  offset(e) {
    return this.toCollection().offset(e);
  }
  limit(e) {
    return this.toCollection().limit(e);
  }
  each(e) {
    return this.toCollection().each(e);
  }
  toArray(e) {
    return this.toCollection().toArray(e);
  }
  toCollection() {
    return new this.db.Collection(new this.db.WhereClause(this));
  }
  orderBy(e) {
    return new this.db.Collection(new this.db.WhereClause(this, F(e) ? `[${e.join("+")}]` : e));
  }
  reverse() {
    return this.toCollection().reverse();
  }
  mapToClass(e) {
    this.schema.mappedClass = e;
    const n = (r) => {
      if (!r)
        return r;
      const s = Object.create(e.prototype);
      for (var a in r)
        if (V(r, a))
          try {
            s[a] = r[a];
          } catch {
          }
      return s;
    };
    return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = n, this.hook("reading", n), e;
  }
  defineClass() {
    return this.mapToClass(function(e) {
      $(this, e);
    });
  }
  add(e, n) {
    const { auto: r, keyPath: s } = this.schema.primKey;
    let a = e;
    return s && r && (a = tt(s)(e)), this._trans("readwrite", (i) => this.core.mutate({ trans: i, type: "add", keys: n != null ? [n] : null, values: [a] })).then((i) => i.numFailures ? S.reject(i.failures[0]) : i.lastResult).then((i) => {
      if (s)
        try {
          G(e, s, i);
        } catch {
        }
      return i;
    });
  }
  update(e, n) {
    if (typeof e != "object" || F(e))
      return this.where(":id").equals(e).modify(n);
    {
      const r = ne(e, this.schema.primKey.keyPath);
      if (r === void 0)
        return M(new R.InvalidArgument("Given object does not contain its primary key"));
      try {
        typeof n != "function" ? I(n).forEach((s) => {
          G(e, s, n[s]);
        }) : n(e, { value: e, primKey: r });
      } catch {
      }
      return this.where(":id").equals(r).modify(n);
    }
  }
  put(e, n) {
    const { auto: r, keyPath: s } = this.schema.primKey;
    let a = e;
    return s && r && (a = tt(s)(e)), this._trans("readwrite", (i) => this.core.mutate({ trans: i, type: "put", values: [a], keys: n != null ? [n] : null })).then((i) => i.numFailures ? S.reject(i.failures[0]) : i.lastResult).then((i) => {
      if (s)
        try {
          G(e, s, i);
        } catch {
        }
      return i;
    });
  }
  delete(e) {
    return this._trans("readwrite", (n) => this.core.mutate({ trans: n, type: "delete", keys: [e] })).then((n) => n.numFailures ? S.reject(n.failures[0]) : void 0);
  }
  clear() {
    return this._trans("readwrite", (e) => this.core.mutate({ trans: e, type: "deleteRange", range: er })).then((e) => e.numFailures ? S.reject(e.failures[0]) : void 0);
  }
  bulkGet(e) {
    return this._trans("readonly", (n) => this.core.getMany({ keys: e, trans: n }).then((r) => r.map((s) => this.hook.reading.fire(s))));
  }
  bulkAdd(e, n, r) {
    const s = Array.isArray(n) ? n : void 0, a = (r = r || (s ? void 0 : n)) ? r.allKeys : void 0;
    return this._trans("readwrite", (i) => {
      const { auto: o, keyPath: c } = this.schema.primKey;
      if (c && s)
        throw new R.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (s && s.length !== e.length)
        throw new R.InvalidArgument("Arguments objects and keys must have the same length");
      const d = e.length;
      let l = c && o ? e.map(tt(c)) : e;
      return this.core.mutate({ trans: i, type: "add", keys: s, values: l, wantResults: a }).then(({ numFailures: h, results: u, lastResult: m, failures: g }) => {
        if (h === 0)
          return a ? u : m;
        throw new Ie(`${this.name}.bulkAdd(): ${h} of ${d} operations failed`, g);
      });
    });
  }
  bulkPut(e, n, r) {
    const s = Array.isArray(n) ? n : void 0, a = (r = r || (s ? void 0 : n)) ? r.allKeys : void 0;
    return this._trans("readwrite", (i) => {
      const { auto: o, keyPath: c } = this.schema.primKey;
      if (c && s)
        throw new R.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (s && s.length !== e.length)
        throw new R.InvalidArgument("Arguments objects and keys must have the same length");
      const d = e.length;
      let l = c && o ? e.map(tt(c)) : e;
      return this.core.mutate({ trans: i, type: "put", keys: s, values: l, wantResults: a }).then(({ numFailures: h, results: u, lastResult: m, failures: g }) => {
        if (h === 0)
          return a ? u : m;
        throw new Ie(`${this.name}.bulkPut(): ${h} of ${d} operations failed`, g);
      });
    });
  }
  bulkDelete(e) {
    const n = e.length;
    return this._trans("readwrite", (r) => this.core.mutate({ trans: r, type: "delete", keys: e })).then(({ numFailures: r, lastResult: s, failures: a }) => {
      if (r === 0)
        return s;
      throw new Ie(`${this.name}.bulkDelete(): ${r} of ${n} operations failed`, a);
    });
  }
}
function qe(t) {
  var e = {}, n = function(i, o) {
    if (o) {
      for (var c = arguments.length, d = new Array(c - 1); --c; )
        d[c - 1] = arguments[c];
      return e[i].subscribe.apply(null, d), t;
    }
    if (typeof i == "string")
      return e[i];
  };
  n.addEventType = a;
  for (var r = 1, s = arguments.length; r < s; ++r)
    a(arguments[r]);
  return n;
  function a(i, o, c) {
    if (typeof i != "object") {
      var d;
      o || (o = Ir), c || (c = A);
      var l = { subscribers: [], fire: c, subscribe: function(h) {
        l.subscribers.indexOf(h) === -1 && (l.subscribers.push(h), l.fire = o(l.fire, h));
      }, unsubscribe: function(h) {
        l.subscribers = l.subscribers.filter(function(u) {
          return u !== h;
        }), l.fire = l.subscribers.reduce(o, c);
      } };
      return e[i] = n[i] = l, l;
    }
    I(d = i).forEach(function(h) {
      var u = d[h];
      if (F(u))
        a(h, d[h][0], d[h][1]);
      else {
        if (u !== "asap")
          throw new R.InvalidArgument("Invalid event config");
        var m = a(h, $e, function() {
          for (var g = arguments.length, p = new Array(g); g--; )
            p[g] = arguments[g];
          m.subscribers.forEach(function(b) {
            Tn(function() {
              b.apply(null, p);
            });
          });
        });
      }
    });
  }
}
function je(t, e) {
  return Se(e).from({ prototype: t }), e;
}
function ke(t, e) {
  return !(t.filter || t.algorithm || t.or) && (e ? t.justLimit : !t.replayFilter);
}
function Kt(t, e) {
  t.filter = be(t.filter, e);
}
function Ot(t, e, n) {
  var r = t.replayFilter;
  t.replayFilter = r ? () => be(r(), e()) : e, t.justLimit = n && !r;
}
function ht(t, e) {
  if (t.isPrimKey)
    return e.primaryKey;
  const n = e.getIndexByKeyPath(t.index);
  if (!n)
    throw new R.Schema("KeyPath " + t.index + " on object store " + e.name + " is not indexed");
  return n;
}
function xn(t, e, n) {
  const r = ht(t, e.schema);
  return e.openCursor({ trans: n, values: !t.keysOnly, reverse: t.dir === "prev", unique: !!t.unique, query: { index: r, range: t.range } });
}
function nt(t, e, n, r) {
  const s = t.replayFilter ? be(t.filter, t.replayFilter()) : t.filter;
  if (t.or) {
    const a = {}, i = (o, c, d) => {
      if (!s || s(c, d, (u) => c.stop(u), (u) => c.fail(u))) {
        var l = c.primaryKey, h = "" + l;
        h === "[object ArrayBuffer]" && (h = "" + new Uint8Array(l)), V(a, h) || (a[h] = !0, e(o, c, d));
      }
    };
    return Promise.all([t.or._iterate(i, n), En(xn(t, r, n), t.algorithm, i, !t.keysOnly && t.valueMapper)]);
  }
  return En(xn(t, r, n), be(t.algorithm, s), e, !t.keysOnly && t.valueMapper);
}
function En(t, e, n, r) {
  var s = D(r ? (a, i, o) => n(r(a), i, o) : n);
  return t.then((a) => {
    if (a)
      return a.start(() => {
        var i = () => a.continue();
        e && !e(a, (o) => i = o, (o) => {
          a.stop(o), i = A;
        }, (o) => {
          a.fail(o), i = A;
        }) || s(a.value, a, (o) => i = o), i();
      });
  });
}
function L(t, e) {
  try {
    const n = Sn(t), r = Sn(e);
    if (n !== r)
      return n === "Array" ? 1 : r === "Array" ? -1 : n === "binary" ? 1 : r === "binary" ? -1 : n === "string" ? 1 : r === "string" ? -1 : n === "Date" ? 1 : r !== "Date" ? NaN : -1;
    switch (n) {
      case "number":
      case "Date":
      case "string":
        return t > e ? 1 : t < e ? -1 : 0;
      case "binary":
        return function(s, a) {
          const i = s.length, o = a.length, c = i < o ? i : o;
          for (let d = 0; d < c; ++d)
            if (s[d] !== a[d])
              return s[d] < a[d] ? -1 : 1;
          return i === o ? 0 : i < o ? -1 : 1;
        }(Cn(t), Cn(e));
      case "Array":
        return function(s, a) {
          const i = s.length, o = a.length, c = i < o ? i : o;
          for (let d = 0; d < c; ++d) {
            const l = L(s[d], a[d]);
            if (l !== 0)
              return l;
          }
          return i === o ? 0 : i < o ? -1 : 1;
        }(t, e);
    }
  } catch {
  }
  return NaN;
}
function Sn(t) {
  const e = typeof t;
  if (e !== "object")
    return e;
  if (ArrayBuffer.isView(t))
    return "binary";
  const n = Tt(t);
  return n === "ArrayBuffer" ? "binary" : n;
}
function Cn(t) {
  return t instanceof Uint8Array ? t : ArrayBuffer.isView(t) ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : new Uint8Array(t);
}
class Vr {
  _read(e, n) {
    var r = this._ctx;
    return r.error ? r.table._trans(null, M.bind(null, r.error)) : r.table._trans("readonly", e).then(n);
  }
  _write(e) {
    var n = this._ctx;
    return n.error ? n.table._trans(null, M.bind(null, n.error)) : n.table._trans("readwrite", e, "locked");
  }
  _addAlgorithm(e) {
    var n = this._ctx;
    n.algorithm = be(n.algorithm, e);
  }
  _iterate(e, n) {
    return nt(this._ctx, e, n, this._ctx.table.core);
  }
  clone(e) {
    var n = Object.create(this.constructor.prototype), r = Object.create(this._ctx);
    return e && $(r, e), n._ctx = r, n;
  }
  raw() {
    return this._ctx.valueMapper = null, this;
  }
  each(e) {
    var n = this._ctx;
    return this._read((r) => nt(n, e, r, n.table.core));
  }
  count(e) {
    return this._read((n) => {
      const r = this._ctx, s = r.table.core;
      if (ke(r, !0))
        return s.count({ trans: n, query: { index: ht(r, s.schema), range: r.range } }).then((i) => Math.min(i, r.limit));
      var a = 0;
      return nt(r, () => (++a, !1), n, s).then(() => a);
    }).then(e);
  }
  sortBy(e, n) {
    const r = e.split(".").reverse(), s = r[0], a = r.length - 1;
    function i(d, l) {
      return l ? i(d[r[l]], l - 1) : d[s];
    }
    var o = this._ctx.dir === "next" ? 1 : -1;
    function c(d, l) {
      var h = i(d, a), u = i(l, a);
      return h < u ? -o : h > u ? o : 0;
    }
    return this.toArray(function(d) {
      return d.sort(c);
    }).then(n);
  }
  toArray(e) {
    return this._read((n) => {
      var r = this._ctx;
      if (r.dir === "next" && ke(r, !0) && r.limit > 0) {
        const { valueMapper: s } = r, a = ht(r, r.table.core.schema);
        return r.table.core.query({ trans: n, limit: r.limit, values: !0, query: { index: a, range: r.range } }).then(({ result: i }) => s ? i.map(s) : i);
      }
      {
        const s = [];
        return nt(r, (a) => s.push(a), n, r.table.core).then(() => s);
      }
    }, e);
  }
  offset(e) {
    var n = this._ctx;
    return e <= 0 || (n.offset += e, ke(n) ? Ot(n, () => {
      var r = e;
      return (s, a) => r === 0 || (r === 1 ? (--r, !1) : (a(() => {
        s.advance(r), r = 0;
      }), !1));
    }) : Ot(n, () => {
      var r = e;
      return () => --r < 0;
    })), this;
  }
  limit(e) {
    return this._ctx.limit = Math.min(this._ctx.limit, e), Ot(this._ctx, () => {
      var n = e;
      return function(r, s, a) {
        return --n <= 0 && s(a), n >= 0;
      };
    }, !0), this;
  }
  until(e, n) {
    return Kt(this._ctx, function(r, s, a) {
      return !e(r.value) || (s(a), n);
    }), this;
  }
  first(e) {
    return this.limit(1).toArray(function(n) {
      return n[0];
    }).then(e);
  }
  last(e) {
    return this.reverse().first(e);
  }
  filter(e) {
    var n, r;
    return Kt(this._ctx, function(s) {
      return e(s.value);
    }), n = this._ctx, r = e, n.isMatch = be(n.isMatch, r), this;
  }
  and(e) {
    return this.filter(e);
  }
  or(e) {
    return new this.db.WhereClause(this._ctx.table, e, this);
  }
  reverse() {
    return this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), this;
  }
  desc() {
    return this.reverse();
  }
  eachKey(e) {
    var n = this._ctx;
    return n.keysOnly = !n.isMatch, this.each(function(r, s) {
      e(s.key, s);
    });
  }
  eachUniqueKey(e) {
    return this._ctx.unique = "unique", this.eachKey(e);
  }
  eachPrimaryKey(e) {
    var n = this._ctx;
    return n.keysOnly = !n.isMatch, this.each(function(r, s) {
      e(s.primaryKey, s);
    });
  }
  keys(e) {
    var n = this._ctx;
    n.keysOnly = !n.isMatch;
    var r = [];
    return this.each(function(s, a) {
      r.push(a.key);
    }).then(function() {
      return r;
    }).then(e);
  }
  primaryKeys(e) {
    var n = this._ctx;
    if (n.dir === "next" && ke(n, !0) && n.limit > 0)
      return this._read((s) => {
        var a = ht(n, n.table.core.schema);
        return n.table.core.query({ trans: s, values: !1, limit: n.limit, query: { index: a, range: n.range } });
      }).then(({ result: s }) => s).then(e);
    n.keysOnly = !n.isMatch;
    var r = [];
    return this.each(function(s, a) {
      r.push(a.primaryKey);
    }).then(function() {
      return r;
    }).then(e);
  }
  uniqueKeys(e) {
    return this._ctx.unique = "unique", this.keys(e);
  }
  firstKey(e) {
    return this.limit(1).keys(function(n) {
      return n[0];
    }).then(e);
  }
  lastKey(e) {
    return this.reverse().firstKey(e);
  }
  distinct() {
    var e = this._ctx, n = e.index && e.table.schema.idxByName[e.index];
    if (!n || !n.multi)
      return this;
    var r = {};
    return Kt(this._ctx, function(s) {
      var a = s.primaryKey.toString(), i = V(r, a);
      return r[a] = !0, !i;
    }), this;
  }
  modify(e) {
    var n = this._ctx;
    return this._write((r) => {
      var s;
      if (typeof e == "function")
        s = e;
      else {
        var a = I(e), i = a.length;
        s = function(p) {
          for (var b = !1, y = 0; y < i; ++y) {
            var f = a[y], w = e[f];
            ne(p, f) !== w && (G(p, f, w), b = !0);
          }
          return b;
        };
      }
      const o = n.table.core, { outbound: c, extractKey: d } = o.schema.primaryKey, l = this.db._options.modifyChunkSize || 200, h = [];
      let u = 0;
      const m = [], g = (p, b) => {
        const { failures: y, numFailures: f } = b;
        u += p - f;
        for (let w of I(y))
          h.push(y[w]);
      };
      return this.clone().primaryKeys().then((p) => {
        const b = (y) => {
          const f = Math.min(l, p.length - y);
          return o.getMany({ trans: r, keys: p.slice(y, y + f), cache: "immutable" }).then((w) => {
            const C = [], E = [], x = c ? [] : null, v = [];
            for (let k = 0; k < f; ++k) {
              const T = w[k], O = { value: Ye(T), primKey: p[y + k] };
              s.call(O, O.value, O) !== !1 && (O.value == null ? v.push(p[y + k]) : c || L(d(T), d(O.value)) === 0 ? (E.push(O.value), c && x.push(p[y + k])) : (v.push(p[y + k]), C.push(O.value)));
            }
            const K = ke(n) && n.limit === 1 / 0 && (typeof e != "function" || e === At) && { index: n.index, range: n.range };
            return Promise.resolve(C.length > 0 && o.mutate({ trans: r, type: "add", values: C }).then((k) => {
              for (let T in k.failures)
                v.splice(parseInt(T), 1);
              g(C.length, k);
            })).then(() => (E.length > 0 || K && typeof e == "object") && o.mutate({ trans: r, type: "put", keys: x, values: E, criteria: K, changeSpec: typeof e != "function" && e }).then((k) => g(E.length, k))).then(() => (v.length > 0 || K && e === At) && o.mutate({ trans: r, type: "delete", keys: v, criteria: K }).then((k) => g(v.length, k))).then(() => p.length > y + f && b(y + l));
          });
        };
        return b(0).then(() => {
          if (h.length > 0)
            throw new pt("Error modifying one or more objects", h, u, m);
          return p.length;
        });
      });
    });
  }
  delete() {
    var e = this._ctx, n = e.range;
    return ke(e) && (e.isPrimKey && !Wr || n.type === 3) ? this._write((r) => {
      const { primaryKey: s } = e.table.core.schema, a = n;
      return e.table.core.count({ trans: r, query: { index: s, range: a } }).then((i) => e.table.core.mutate({ trans: r, type: "deleteRange", range: a }).then(({ failures: o, lastResult: c, results: d, numFailures: l }) => {
        if (l)
          throw new pt("Could not delete some values", Object.keys(o).map((h) => o[h]), i - l);
        return i - l;
      }));
    }) : this.modify(At);
  }
}
const At = (t, e) => e.value = null;
function Gr(t, e) {
  return t < e ? -1 : t === e ? 0 : 1;
}
function zr(t, e) {
  return t > e ? -1 : t === e ? 0 : 1;
}
function H(t, e, n) {
  var r = t instanceof nr ? new t.Collection(t) : t;
  return r._ctx.error = n ? new n(e) : new TypeError(e), r;
}
function xe(t) {
  return new t.Collection(t, () => tr("")).limit(0);
}
function Yr(t, e, n, r, s, a) {
  for (var i = Math.min(t.length, r.length), o = -1, c = 0; c < i; ++c) {
    var d = e[c];
    if (d !== r[c])
      return s(t[c], n[c]) < 0 ? t.substr(0, c) + n[c] + n.substr(c + 1) : s(t[c], r[c]) < 0 ? t.substr(0, c) + r[c] + n.substr(c + 1) : o >= 0 ? t.substr(0, o) + e[o] + n.substr(o + 1) : null;
    s(t[c], d) < 0 && (o = c);
  }
  return i < r.length && a === "next" ? t + n.substr(t.length) : i < t.length && a === "prev" ? t.substr(0, n.length) : o < 0 ? null : t.substr(0, o) + r[o] + n.substr(o + 1);
}
function rt(t, e, n, r) {
  var s, a, i, o, c, d, l, h = n.length;
  if (!n.every((p) => typeof p == "string"))
    return H(t, Jn);
  function u(p) {
    s = /* @__PURE__ */ function(y) {
      return y === "next" ? (f) => f.toUpperCase() : (f) => f.toLowerCase();
    }(p), a = /* @__PURE__ */ function(y) {
      return y === "next" ? (f) => f.toLowerCase() : (f) => f.toUpperCase();
    }(p), i = p === "next" ? Gr : zr;
    var b = n.map(function(y) {
      return { lower: a(y), upper: s(y) };
    }).sort(function(y, f) {
      return i(y.lower, f.lower);
    });
    o = b.map(function(y) {
      return y.upper;
    }), c = b.map(function(y) {
      return y.lower;
    }), d = p, l = p === "next" ? "" : r;
  }
  u("next");
  var m = new t.Collection(t, () => se(o[0], c[h - 1] + r));
  m._ondirectionchange = function(p) {
    u(p);
  };
  var g = 0;
  return m._addAlgorithm(function(p, b, y) {
    var f = p.key;
    if (typeof f != "string")
      return !1;
    var w = a(f);
    if (e(w, c, g))
      return !0;
    for (var C = null, E = g; E < h; ++E) {
      var x = Yr(f, w, o[E], c[E], i, d);
      x === null && C === null ? g = E + 1 : (C === null || i(C, x) > 0) && (C = x);
    }
    return b(C !== null ? function() {
      p.continue(C + l);
    } : y), !1;
  }), m;
}
function se(t, e, n, r) {
  return { type: 2, lower: t, upper: e, lowerOpen: n, upperOpen: r };
}
function tr(t) {
  return { type: 1, lower: t, upper: t };
}
class nr {
  get Collection() {
    return this._ctx.table.db.Collection;
  }
  between(e, n, r, s) {
    r = r !== !1, s = s === !0;
    try {
      return this._cmp(e, n) > 0 || this._cmp(e, n) === 0 && (r || s) && (!r || !s) ? xe(this) : new this.Collection(this, () => se(e, n, !r, !s));
    } catch {
      return H(this, Q);
    }
  }
  equals(e) {
    return e == null ? H(this, Q) : new this.Collection(this, () => tr(e));
  }
  above(e) {
    return e == null ? H(this, Q) : new this.Collection(this, () => se(e, void 0, !0));
  }
  aboveOrEqual(e) {
    return e == null ? H(this, Q) : new this.Collection(this, () => se(e, void 0, !1));
  }
  below(e) {
    return e == null ? H(this, Q) : new this.Collection(this, () => se(void 0, e, !1, !0));
  }
  belowOrEqual(e) {
    return e == null ? H(this, Q) : new this.Collection(this, () => se(void 0, e));
  }
  startsWith(e) {
    return typeof e != "string" ? H(this, Jn) : this.between(e, e + de, !0, !0);
  }
  startsWithIgnoreCase(e) {
    return e === "" ? this.startsWith(e) : rt(this, (n, r) => n.indexOf(r[0]) === 0, [e], de);
  }
  equalsIgnoreCase(e) {
    return rt(this, (n, r) => n === r[0], [e], "");
  }
  anyOfIgnoreCase() {
    var e = Z.apply(Ee, arguments);
    return e.length === 0 ? xe(this) : rt(this, (n, r) => r.indexOf(n) !== -1, e, "");
  }
  startsWithAnyOfIgnoreCase() {
    var e = Z.apply(Ee, arguments);
    return e.length === 0 ? xe(this) : rt(this, (n, r) => r.some((s) => n.indexOf(s) === 0), e, de);
  }
  anyOf() {
    const e = Z.apply(Ee, arguments);
    let n = this._cmp;
    try {
      e.sort(n);
    } catch {
      return H(this, Q);
    }
    if (e.length === 0)
      return xe(this);
    const r = new this.Collection(this, () => se(e[0], e[e.length - 1]));
    r._ondirectionchange = (a) => {
      n = a === "next" ? this._ascending : this._descending, e.sort(n);
    };
    let s = 0;
    return r._addAlgorithm((a, i, o) => {
      const c = a.key;
      for (; n(c, e[s]) > 0; )
        if (++s, s === e.length)
          return i(o), !1;
      return n(c, e[s]) === 0 || (i(() => {
        a.continue(e[s]);
      }), !1);
    }), r;
  }
  notEqual(e) {
    return this.inAnyRange([[Vt, e], [e, this.db._maxKey]], { includeLowers: !1, includeUppers: !1 });
  }
  noneOf() {
    const e = Z.apply(Ee, arguments);
    if (e.length === 0)
      return new this.Collection(this);
    try {
      e.sort(this._ascending);
    } catch {
      return H(this, Q);
    }
    const n = e.reduce((r, s) => r ? r.concat([[r[r.length - 1][1], s]]) : [[Vt, s]], null);
    return n.push([e[e.length - 1], this.db._maxKey]), this.inAnyRange(n, { includeLowers: !1, includeUppers: !1 });
  }
  inAnyRange(e, n) {
    const r = this._cmp, s = this._ascending, a = this._descending, i = this._min, o = this._max;
    if (e.length === 0)
      return xe(this);
    if (!e.every((f) => f[0] !== void 0 && f[1] !== void 0 && s(f[0], f[1]) <= 0))
      return H(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", R.InvalidArgument);
    const c = !n || n.includeLowers !== !1, d = n && n.includeUppers === !0;
    let l, h = s;
    function u(f, w) {
      return h(f[0], w[0]);
    }
    try {
      l = e.reduce(function(f, w) {
        let C = 0, E = f.length;
        for (; C < E; ++C) {
          const x = f[C];
          if (r(w[0], x[1]) < 0 && r(w[1], x[0]) > 0) {
            x[0] = i(x[0], w[0]), x[1] = o(x[1], w[1]);
            break;
          }
        }
        return C === E && f.push(w), f;
      }, []), l.sort(u);
    } catch {
      return H(this, Q);
    }
    let m = 0;
    const g = d ? (f) => s(f, l[m][1]) > 0 : (f) => s(f, l[m][1]) >= 0, p = c ? (f) => a(f, l[m][0]) > 0 : (f) => a(f, l[m][0]) >= 0;
    let b = g;
    const y = new this.Collection(this, () => se(l[0][0], l[l.length - 1][1], !c, !d));
    return y._ondirectionchange = (f) => {
      f === "next" ? (b = g, h = s) : (b = p, h = a), l.sort(u);
    }, y._addAlgorithm((f, w, C) => {
      for (var E = f.key; b(E); )
        if (++m, m === l.length)
          return w(C), !1;
      return !!function(x) {
        return !g(x) && !p(x);
      }(E) || (this._cmp(E, l[m][1]) === 0 || this._cmp(E, l[m][0]) === 0 || w(() => {
        h === s ? f.continue(l[m][0]) : f.continue(l[m][1]);
      }), !1);
    }), y;
  }
  startsWithAnyOf() {
    const e = Z.apply(Ee, arguments);
    return e.every((n) => typeof n == "string") ? e.length === 0 ? xe(this) : this.inAnyRange(e.map((n) => [n, n + de])) : H(this, "startsWithAnyOf() only works with strings");
  }
}
function z(t) {
  return D(function(e) {
    return He(e), t(e.target.error), !1;
  });
}
function He(t) {
  t.stopPropagation && t.stopPropagation(), t.preventDefault && t.preventDefault();
}
const Ve = "storagemutated", ie = "x-storagemutated-1", le = qe(null, Ve);
class Qr {
  _lock() {
    return Te(!P.global), ++this._reculock, this._reculock !== 1 || P.global || (P.lockOwnerFor = this), this;
  }
  _unlock() {
    if (Te(!P.global), --this._reculock == 0)
      for (P.global || (P.lockOwnerFor = null); this._blockedFuncs.length > 0 && !this._locked(); ) {
        var e = this._blockedFuncs.shift();
        try {
          Oe(e[1], e[0]);
        } catch {
        }
      }
    return this;
  }
  _locked() {
    return this._reculock && P.lockOwnerFor !== this;
  }
  create(e) {
    if (!this.mode)
      return this;
    const n = this.db.idbdb, r = this.db._state.dbOpenError;
    if (Te(!this.idbtrans), !e && !n)
      switch (r && r.name) {
        case "DatabaseClosedError":
          throw new R.DatabaseClosed(r);
        case "MissingAPIError":
          throw new R.MissingAPI(r.message, r);
        default:
          throw new R.OpenFailed(r);
      }
    if (!this.active)
      throw new R.TransactionInactive();
    return Te(this._completion._state === null), (e = this.idbtrans = e || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : n.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }))).onerror = D((s) => {
      He(s), this._reject(e.error);
    }), e.onabort = D((s) => {
      He(s), this.active && this._reject(new R.Abort(e.error)), this.active = !1, this.on("abort").fire(s);
    }), e.oncomplete = D(() => {
      this.active = !1, this._resolve(), "mutatedParts" in e && le.storagemutated.fire(e.mutatedParts);
    }), this;
  }
  _promise(e, n, r) {
    if (e === "readwrite" && this.mode !== "readwrite")
      return M(new R.ReadOnly("Transaction is readonly"));
    if (!this.active)
      return M(new R.TransactionInactive());
    if (this._locked())
      return new S((a, i) => {
        this._blockedFuncs.push([() => {
          this._promise(e, n, r).then(a, i);
        }, P]);
      });
    if (r)
      return oe(() => {
        var a = new S((i, o) => {
          this._lock();
          const c = n(i, o, this);
          c && c.then && c.then(i, o);
        });
        return a.finally(() => this._unlock()), a._lib = !0, a;
      });
    var s = new S((a, i) => {
      var o = n(a, i, this);
      o && o.then && o.then(a, i);
    });
    return s._lib = !0, s;
  }
  _root() {
    return this.parent ? this.parent._root() : this;
  }
  waitFor(e) {
    var n = this._root();
    const r = S.resolve(e);
    if (n._waitingFor)
      n._waitingFor = n._waitingFor.then(() => r);
    else {
      n._waitingFor = r, n._waitingQueue = [];
      var s = n.idbtrans.objectStore(n.storeNames[0]);
      (function i() {
        for (++n._spinCount; n._waitingQueue.length; )
          n._waitingQueue.shift()();
        n._waitingFor && (s.get(-1 / 0).onsuccess = i);
      })();
    }
    var a = n._waitingFor;
    return new S((i, o) => {
      r.then((c) => n._waitingQueue.push(D(i.bind(null, c))), (c) => n._waitingQueue.push(D(o.bind(null, c)))).finally(() => {
        n._waitingFor === a && (n._waitingFor = null);
      });
    });
  }
  abort() {
    this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new R.Abort()));
  }
  table(e) {
    const n = this._memoizedTables || (this._memoizedTables = {});
    if (V(n, e))
      return n[e];
    const r = this.schema[e];
    if (!r)
      throw new R.NotFound("Table " + e + " not part of transaction");
    const s = new this.db.Table(e, r, this);
    return s.core = this.db.core.table(e), n[e] = s, s;
  }
}
function Gt(t, e, n, r, s, a, i) {
  return { name: t, keyPath: e, unique: n, multi: r, auto: s, compound: a, src: (n && !i ? "&" : "") + (r ? "*" : "") + (s ? "++" : "") + rr(e) };
}
function rr(t) {
  return typeof t == "string" ? t : t ? "[" + [].join.call(t, "+") + "]" : "";
}
function sr(t, e, n) {
  return { name: t, primKey: e, indexes: n, mappedClass: null, idxByName: Bn(n, (r) => [r.name, r]) };
}
let Ge = (t) => {
  try {
    return t.only([[]]), Ge = () => [[]], [[]];
  } catch {
    return Ge = () => de, de;
  }
};
function zt(t) {
  return t == null ? () => {
  } : typeof t == "string" ? function(e) {
    return e.split(".").length === 1 ? (r) => r[e] : (r) => ne(r, e);
  }(t) : (e) => ne(e, t);
}
function Pn(t) {
  return [].slice.call(t);
}
let Xr = 0;
function Fe(t) {
  return t == null ? ":id" : typeof t == "string" ? t : `[${t.join("+")}]`;
}
function Jr(t, e, n) {
  function r(c) {
    if (c.type === 3)
      return null;
    if (c.type === 4)
      throw new Error("Cannot convert never type to IDBKeyRange");
    const { lower: d, upper: l, lowerOpen: h, upperOpen: u } = c;
    return d === void 0 ? l === void 0 ? null : e.upperBound(l, !!u) : l === void 0 ? e.lowerBound(d, !!h) : e.bound(d, l, !!h, !!u);
  }
  const { schema: s, hasGetAll: a } = function(c, d) {
    const l = Pn(c.objectStoreNames);
    return { schema: { name: c.name, tables: l.map((h) => d.objectStore(h)).map((h) => {
      const { keyPath: u, autoIncrement: m } = h, g = F(u), p = u == null, b = {}, y = { name: h.name, primaryKey: { name: null, isPrimaryKey: !0, outbound: p, compound: g, keyPath: u, autoIncrement: m, unique: !0, extractKey: zt(u) }, indexes: Pn(h.indexNames).map((f) => h.index(f)).map((f) => {
        const { name: w, unique: C, multiEntry: E, keyPath: x } = f, v = { name: w, compound: F(x), keyPath: x, unique: C, multiEntry: E, extractKey: zt(x) };
        return b[Fe(x)] = v, v;
      }), getIndexByKeyPath: (f) => b[Fe(f)] };
      return b[":id"] = y.primaryKey, u != null && (b[Fe(u)] = y.primaryKey), y;
    }) }, hasGetAll: l.length > 0 && "getAll" in d.objectStore(l[0]) && !(typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) };
  }(t, n), i = s.tables.map((c) => function(d) {
    const l = d.name;
    return { name: l, schema: d, mutate: function({ trans: h, type: u, keys: m, values: g, range: p }) {
      return new Promise((b, y) => {
        b = D(b);
        const f = h.objectStore(l), w = f.keyPath == null, C = u === "put" || u === "add";
        if (!C && u !== "delete" && u !== "deleteRange")
          throw new Error("Invalid operation type: " + u);
        const { length: E } = m || g || { length: 1 };
        if (m && g && m.length !== g.length)
          throw new Error("Given keys array must have same length as given values array.");
        if (E === 0)
          return b({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
        let x;
        const v = [], K = [];
        let k = 0;
        const T = (U) => {
          ++k, He(U);
        };
        if (u === "deleteRange") {
          if (p.type === 4)
            return b({ numFailures: k, failures: K, results: [], lastResult: void 0 });
          p.type === 3 ? v.push(x = f.clear()) : v.push(x = f.delete(r(p)));
        } else {
          const [U, N] = C ? w ? [g, m] : [g, null] : [m, null];
          if (C)
            for (let B = 0; B < E; ++B)
              v.push(x = N && N[B] !== void 0 ? f[u](U[B], N[B]) : f[u](U[B])), x.onerror = T;
          else
            for (let B = 0; B < E; ++B)
              v.push(x = f[u](U[B])), x.onerror = T;
        }
        const O = (U) => {
          const N = U.target.result;
          v.forEach((B, we) => B.error != null && (K[we] = B.error)), b({ numFailures: k, failures: K, results: u === "delete" ? m : v.map((B) => B.result), lastResult: N });
        };
        x.onerror = (U) => {
          T(U), O(U);
        }, x.onsuccess = O;
      });
    }, getMany: ({ trans: h, keys: u }) => new Promise((m, g) => {
      m = D(m);
      const p = h.objectStore(l), b = u.length, y = new Array(b);
      let f, w = 0, C = 0;
      const E = (v) => {
        const K = v.target;
        y[K._pos] = K.result, ++C === w && m(y);
      }, x = z(g);
      for (let v = 0; v < b; ++v)
        u[v] != null && (f = p.get(u[v]), f._pos = v, f.onsuccess = E, f.onerror = x, ++w);
      w === 0 && m(y);
    }), get: ({ trans: h, key: u }) => new Promise((m, g) => {
      m = D(m);
      const p = h.objectStore(l).get(u);
      p.onsuccess = (b) => m(b.target.result), p.onerror = z(g);
    }), query: /* @__PURE__ */ function(h) {
      return (u) => new Promise((m, g) => {
        m = D(m);
        const { trans: p, values: b, limit: y, query: f } = u, w = y === 1 / 0 ? void 0 : y, { index: C, range: E } = f, x = p.objectStore(l), v = C.isPrimaryKey ? x : x.index(C.name), K = r(E);
        if (y === 0)
          return m({ result: [] });
        if (h) {
          const k = b ? v.getAll(K, w) : v.getAllKeys(K, w);
          k.onsuccess = (T) => m({ result: T.target.result }), k.onerror = z(g);
        } else {
          let k = 0;
          const T = b || !("openKeyCursor" in v) ? v.openCursor(K) : v.openKeyCursor(K), O = [];
          T.onsuccess = (U) => {
            const N = T.result;
            return N ? (O.push(b ? N.value : N.primaryKey), ++k === y ? m({ result: O }) : void N.continue()) : m({ result: O });
          }, T.onerror = z(g);
        }
      });
    }(a), openCursor: function({ trans: h, values: u, query: m, reverse: g, unique: p }) {
      return new Promise((b, y) => {
        b = D(b);
        const { index: f, range: w } = m, C = h.objectStore(l), E = f.isPrimaryKey ? C : C.index(f.name), x = g ? p ? "prevunique" : "prev" : p ? "nextunique" : "next", v = u || !("openKeyCursor" in E) ? E.openCursor(r(w), x) : E.openKeyCursor(r(w), x);
        v.onerror = z(y), v.onsuccess = D((K) => {
          const k = v.result;
          if (!k)
            return void b(null);
          k.___id = ++Xr, k.done = !1;
          const T = k.continue.bind(k);
          let O = k.continuePrimaryKey;
          O && (O = O.bind(k));
          const U = k.advance.bind(k), N = () => {
            throw new Error("Cursor not stopped");
          };
          k.trans = h, k.stop = k.continue = k.continuePrimaryKey = k.advance = () => {
            throw new Error("Cursor not started");
          }, k.fail = D(y), k.next = function() {
            let B = 1;
            return this.start(() => B-- ? this.continue() : this.stop()).then(() => this);
          }, k.start = (B) => {
            const we = new Promise((W, ue) => {
              W = D(W), v.onerror = z(ue), k.fail = ue, k.stop = (Ae) => {
                k.stop = k.continue = k.continuePrimaryKey = k.advance = N, W(Ae);
              };
            }), _e = () => {
              if (v.result)
                try {
                  B();
                } catch (W) {
                  k.fail(W);
                }
              else
                k.done = !0, k.start = () => {
                  throw new Error("Cursor behind last entry");
                }, k.stop();
            };
            return v.onsuccess = D((W) => {
              v.onsuccess = _e, _e();
            }), k.continue = T, k.continuePrimaryKey = O, k.advance = U, _e(), we;
          }, b(k);
        }, y);
      });
    }, count({ query: h, trans: u }) {
      const { index: m, range: g } = h;
      return new Promise((p, b) => {
        const y = u.objectStore(l), f = m.isPrimaryKey ? y : y.index(m.name), w = r(g), C = w ? f.count(w) : f.count();
        C.onsuccess = D((E) => p(E.target.result)), C.onerror = z(b);
      });
    } };
  }(c)), o = {};
  return i.forEach((c) => o[c.name] = c), { stack: "dbcore", transaction: t.transaction.bind(t), table(c) {
    if (!o[c])
      throw new Error(`Table '${c}' not found`);
    return o[c];
  }, MIN_KEY: -1 / 0, MAX_KEY: Ge(e), schema: s };
}
function Yt({ _novip: t }, e) {
  const n = e.db, r = function(s, a, { IDBKeyRange: i, indexedDB: o }, c) {
    return { dbcore: function(l, h) {
      return h.reduce((u, { create: m }) => ({ ...u, ...m(u) }), l);
    }(Jr(a, i, c), s.dbcore) };
  }(t._middlewares, n, t._deps, e);
  t.core = r.dbcore, t.tables.forEach((s) => {
    const a = s.name;
    t.core.schema.tables.some((i) => i.name === a) && (s.core = t.core.table(a), t[a] instanceof t.Table && (t[a].core = s.core));
  });
}
function vt({ _novip: t }, e, n, r) {
  n.forEach((s) => {
    const a = r[s];
    e.forEach((i) => {
      const o = sn(i, s);
      (!o || "value" in o && o.value === void 0) && (i === t.Transaction.prototype || i instanceof t.Transaction ? te(i, s, { get() {
        return this.table(s);
      }, set(c) {
        jn(this, s, { value: c, writable: !0, configurable: !0, enumerable: !0 });
      } }) : i[s] = new t.Table(s, a));
    });
  });
}
function Qt({ _novip: t }, e) {
  e.forEach((n) => {
    for (let r in n)
      n[r] instanceof t.Table && delete n[r];
  });
}
function Zr(t, e) {
  return t._cfg.version - e._cfg.version;
}
function es(t, e, n, r) {
  const s = t._dbSchema, a = t._createTransaction("readwrite", t._storeNames, s);
  a.create(n), a._completion.catch(r);
  const i = a._reject.bind(a), o = P.transless || P;
  oe(() => {
    P.trans = a, P.transless = o, e === 0 ? (I(s).forEach((c) => {
      jt(n, c, s[c].primKey, s[c].indexes);
    }), Yt(t, n), S.follow(() => t.on.populate.fire(a)).catch(i)) : function({ _novip: c }, d, l, h) {
      const u = [], m = c._versions;
      let g = c._dbSchema = Jt(c, c.idbdb, h), p = !1;
      const b = m.filter((f) => f._cfg.version >= d);
      function y() {
        return u.length ? S.resolve(u.shift()(l.idbtrans)).then(y) : S.resolve();
      }
      return b.forEach((f) => {
        u.push(() => {
          const w = g, C = f._cfg.dbschema;
          Zt(c, w, h), Zt(c, C, h), g = c._dbSchema = C;
          const E = ar(w, C);
          E.add.forEach((v) => {
            jt(h, v[0], v[1].primKey, v[1].indexes);
          }), E.change.forEach((v) => {
            if (v.recreate)
              throw new R.Upgrade("Not yet support for changing primary key");
            {
              const K = h.objectStore(v.name);
              v.add.forEach((k) => Xt(K, k)), v.change.forEach((k) => {
                K.deleteIndex(k.name), Xt(K, k);
              }), v.del.forEach((k) => K.deleteIndex(k));
            }
          });
          const x = f._cfg.contentUpgrade;
          if (x && f._cfg.version > d) {
            Yt(c, h), l._memoizedTables = {}, p = !0;
            let v = In(C);
            E.del.forEach((O) => {
              v[O] = w[O];
            }), Qt(c, [c.Transaction.prototype]), vt(c, [c.Transaction.prototype], I(v), v), l.schema = v;
            const K = an(x);
            let k;
            K && Ke();
            const T = S.follow(() => {
              if (k = x(l), k && K) {
                var O = re.bind(null, null);
                k.then(O, O);
              }
            });
            return k && typeof k.then == "function" ? S.resolve(k) : T.then(() => k);
          }
        }), u.push((w) => {
          (!p || !$r) && function(C, E) {
            [].slice.call(E.db.objectStoreNames).forEach((x) => C[x] == null && E.db.deleteObjectStore(x));
          }(f._cfg.dbschema, w), Qt(c, [c.Transaction.prototype]), vt(c, [c.Transaction.prototype], c._storeNames, c._dbSchema), l.schema = c._dbSchema;
        });
      }), y().then(() => {
        var f, w;
        w = h, I(f = g).forEach((C) => {
          w.db.objectStoreNames.contains(C) || jt(w, C, f[C].primKey, f[C].indexes);
        });
      });
    }(t, e, a, n).catch(i);
  });
}
function ar(t, e) {
  const n = { del: [], add: [], change: [] };
  let r;
  for (r in t)
    e[r] || n.del.push(r);
  for (r in e) {
    const s = t[r], a = e[r];
    if (s) {
      const i = { name: r, def: a, recreate: !1, del: [], add: [], change: [] };
      if ("" + (s.primKey.keyPath || "") != "" + (a.primKey.keyPath || "") || s.primKey.auto !== a.primKey.auto && !kt)
        i.recreate = !0, n.change.push(i);
      else {
        const o = s.idxByName, c = a.idxByName;
        let d;
        for (d in o)
          c[d] || i.del.push(d);
        for (d in c) {
          const l = o[d], h = c[d];
          l ? l.src !== h.src && i.change.push(h) : i.add.push(h);
        }
        (i.del.length > 0 || i.add.length > 0 || i.change.length > 0) && n.change.push(i);
      }
    } else
      n.add.push([r, a]);
  }
  return n;
}
function jt(t, e, n, r) {
  const s = t.db.createObjectStore(e, n.keyPath ? { keyPath: n.keyPath, autoIncrement: n.auto } : { autoIncrement: n.auto });
  return r.forEach((a) => Xt(s, a)), s;
}
function Xt(t, e) {
  t.createIndex(e.name, e.keyPath, { unique: e.unique, multiEntry: e.multi });
}
function Jt(t, e, n) {
  const r = {};
  return ft(e.objectStoreNames, 0).forEach((s) => {
    const a = n.objectStore(s);
    let i = a.keyPath;
    const o = Gt(rr(i), i || "", !1, !1, !!a.autoIncrement, i && typeof i != "string", !0), c = [];
    for (let l = 0; l < a.indexNames.length; ++l) {
      const h = a.index(a.indexNames[l]);
      i = h.keyPath;
      var d = Gt(h.name, i, !!h.unique, !!h.multiEntry, !1, i && typeof i != "string", !1);
      c.push(d);
    }
    r[s] = sr(s, o, c);
  }), r;
}
function Zt({ _novip: t }, e, n) {
  const r = n.db.objectStoreNames;
  for (let s = 0; s < r.length; ++s) {
    const a = r[s], i = n.objectStore(a);
    t._hasGetAll = "getAll" in i;
    for (let o = 0; o < i.indexNames.length; ++o) {
      const c = i.indexNames[o], d = i.index(c).keyPath, l = typeof d == "string" ? d : "[" + ft(d).join("+") + "]";
      if (e[a]) {
        const h = e[a].idxByName[l];
        h && (h.name = c, delete e[a].idxByName[l], e[a].idxByName[c] = h);
      }
    }
  }
  typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && j.WorkerGlobalScope && j instanceof j.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (t._hasGetAll = !1);
}
class ts {
  _parseStoresSpec(e, n) {
    I(e).forEach((r) => {
      if (e[r] !== null) {
        var s = e[r].split(",").map((i, o) => {
          const c = (i = i.trim()).replace(/([&*]|\+\+)/g, ""), d = /^\[/.test(c) ? c.match(/^\[(.*)\]$/)[1].split("+") : c;
          return Gt(c, d || null, /\&/.test(i), /\*/.test(i), /\+\+/.test(i), F(d), o === 0);
        }), a = s.shift();
        if (a.multi)
          throw new R.Schema("Primary key cannot be multi-valued");
        s.forEach((i) => {
          if (i.auto)
            throw new R.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!i.keyPath)
            throw new R.Schema("Index must have a name and cannot be an empty string");
        }), n[r] = sr(r, a, s);
      }
    });
  }
  stores(e) {
    const n = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? $(this._cfg.storesSource, e) : e;
    const r = n._versions, s = {};
    let a = {};
    return r.forEach((i) => {
      $(s, i._cfg.storesSource), a = i._cfg.dbschema = {}, i._parseStoresSpec(s, a);
    }), n._dbSchema = a, Qt(n, [n._allTables, n, n.Transaction.prototype]), vt(n, [n._allTables, n, n.Transaction.prototype, this._cfg.tables], I(a), a), n._storeNames = I(a), this;
  }
  upgrade(e) {
    return this._cfg.contentUpgrade = ln(this._cfg.contentUpgrade || A, e), this;
  }
}
function fn(t, e) {
  let n = t._dbNamesDB;
  return n || (n = t._dbNamesDB = new me(xt, { addons: [], indexedDB: t, IDBKeyRange: e }), n.version(1).stores({ dbnames: "name" })), n.table("dbnames");
}
function pn(t) {
  return t && typeof t.databases == "function";
}
function en(t) {
  return oe(function() {
    return P.letThrough = !0, t();
  });
}
function ns() {
  var t;
  return !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent) && indexedDB.databases ? new Promise(function(e) {
    var n = function() {
      return indexedDB.databases().finally(e);
    };
    t = setInterval(n, 100), n();
  }).finally(function() {
    return clearInterval(t);
  }) : Promise.resolve();
}
function rs(t) {
  const e = t._state, { indexedDB: n } = t._deps;
  if (e.isBeingOpened || t.idbdb)
    return e.dbReadyPromise.then(() => e.dbOpenError ? M(e.dbOpenError) : t);
  Y && (e.openCanceller._stackHolder = ve()), e.isBeingOpened = !0, e.dbOpenError = null, e.openComplete = !1;
  const r = e.openCanceller;
  function s() {
    if (e.openCanceller !== r)
      throw new R.DatabaseClosed("db.open() was cancelled");
  }
  let a = e.dbReadyResolve, i = null, o = !1;
  return S.race([r, (typeof navigator > "u" ? S.resolve() : ns()).then(() => new S((c, d) => {
    if (s(), !n)
      throw new R.MissingAPI();
    const l = t.name, h = e.autoSchema ? n.open(l) : n.open(l, Math.round(10 * t.verno));
    if (!h)
      throw new R.MissingAPI();
    h.onerror = z(d), h.onblocked = D(t._fireOnBlocked), h.onupgradeneeded = D((u) => {
      if (i = h.transaction, e.autoSchema && !t._options.allowEmptyDB) {
        h.onerror = He, i.abort(), h.result.close();
        const g = n.deleteDatabase(l);
        g.onsuccess = g.onerror = D(() => {
          d(new R.NoSuchDatabase(`Database ${l} doesnt exist`));
        });
      } else {
        i.onerror = z(d);
        var m = u.oldVersion > Math.pow(2, 62) ? 0 : u.oldVersion;
        o = m < 1, t._novip.idbdb = h.result, es(t, m / 10, i, d);
      }
    }, d), h.onsuccess = D(() => {
      i = null;
      const u = t._novip.idbdb = h.result, m = ft(u.objectStoreNames);
      if (m.length > 0)
        try {
          const p = u.transaction((g = m).length === 1 ? g[0] : g, "readonly");
          e.autoSchema ? function({ _novip: b }, y, f) {
            b.verno = y.version / 10;
            const w = b._dbSchema = Jt(0, y, f);
            b._storeNames = ft(y.objectStoreNames, 0), vt(b, [b._allTables], I(w), w);
          }(t, u, p) : (Zt(t, t._dbSchema, p), function(b, y) {
            const f = ar(Jt(0, b.idbdb, y), b._dbSchema);
            return !(f.add.length || f.change.some((w) => w.add.length || w.change.length));
          }(t, p) || console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.")), Yt(t, p);
        } catch {
        }
      var g;
      Ne.push(t), u.onversionchange = D((p) => {
        e.vcFired = !0, t.on("versionchange").fire(p);
      }), u.onclose = D((p) => {
        t.on("close").fire(p);
      }), o && function({ indexedDB: p, IDBKeyRange: b }, y) {
        !pn(p) && y !== xt && fn(p, b).put({ name: y }).catch(A);
      }(t._deps, l), c();
    }, d);
  }))]).then(() => (s(), e.onReadyBeingFired = [], S.resolve(en(() => t.on.ready.fire(t.vip))).then(function c() {
    if (e.onReadyBeingFired.length > 0) {
      let d = e.onReadyBeingFired.reduce(ln, A);
      return e.onReadyBeingFired = [], S.resolve(en(() => d(t.vip))).then(c);
    }
  }))).finally(() => {
    e.onReadyBeingFired = null, e.isBeingOpened = !1;
  }).then(() => t).catch((c) => {
    e.dbOpenError = c;
    try {
      i && i.abort();
    } catch {
    }
    return r === e.openCanceller && t._close(), M(c);
  }).finally(() => {
    e.openComplete = !0, a();
  });
}
function tn(t) {
  var e = (a) => t.next(a), n = s(e), r = s((a) => t.throw(a));
  function s(a) {
    return (i) => {
      var o = a(i), c = o.value;
      return o.done ? c : c && typeof c.then == "function" ? c.then(n, r) : F(c) ? Promise.all(c).then(n, r) : n(c);
    };
  }
  return s(e)();
}
function ss(t, e, n) {
  var r = arguments.length;
  if (r < 2)
    throw new R.InvalidArgument("Too few arguments");
  for (var s = new Array(r - 1); --r; )
    s[r - 1] = arguments[r];
  return n = s.pop(), [t, Mn(s), n];
}
function ir(t, e, n, r, s) {
  return S.resolve().then(() => {
    const a = P.transless || P, i = t._createTransaction(e, n, t._dbSchema, r), o = { trans: i, transless: a };
    if (r)
      i.idbtrans = r.idbtrans;
    else
      try {
        i.create(), t._state.PR1398_maxLoop = 3;
      } catch (h) {
        return h.name === cn.InvalidState && t.isOpen() && --t._state.PR1398_maxLoop > 0 ? (console.warn("Dexie: Need to reopen db"), t._close(), t.open().then(() => ir(t, e, n, null, s))) : M(h);
      }
    const c = an(s);
    let d;
    c && Ke();
    const l = S.follow(() => {
      if (d = s.call(i, i), d)
        if (c) {
          var h = re.bind(null, null);
          d.then(h, h);
        } else
          typeof d.next == "function" && typeof d.throw == "function" && (d = tn(d));
    }, o);
    return (d && typeof d.then == "function" ? S.resolve(d).then((h) => i.active ? h : M(new R.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"))) : l.then(() => d)).then((h) => (r && i._resolve(), i._completion.then(() => h))).catch((h) => (i._reject(h), M(h)));
  });
}
function st(t, e, n) {
  const r = F(t) ? t.slice() : [t];
  for (let s = 0; s < n; ++s)
    r.push(e);
  return r;
}
const as = { stack: "dbcore", name: "VirtualIndexMiddleware", level: 1, create: function(t) {
  return { ...t, table(e) {
    const n = t.table(e), { schema: r } = n, s = {}, a = [];
    function i(l, h, u) {
      const m = Fe(l), g = s[m] = s[m] || [], p = l == null ? 0 : typeof l == "string" ? 1 : l.length, b = h > 0, y = { ...u, isVirtual: b, keyTail: h, keyLength: p, extractKey: zt(l), unique: !b && u.unique };
      return g.push(y), y.isPrimaryKey || a.push(y), p > 1 && i(p === 2 ? l[0] : l.slice(0, p - 1), h + 1, u), g.sort((f, w) => f.keyTail - w.keyTail), y;
    }
    const o = i(r.primaryKey.keyPath, 0, r.primaryKey);
    s[":id"] = [o];
    for (const l of r.indexes)
      i(l.keyPath, 0, l);
    function c(l) {
      const h = l.query.index;
      return h.isVirtual ? { ...l, query: { index: h, range: (u = l.query.range, m = h.keyTail, { type: u.type === 1 ? 2 : u.type, lower: st(u.lower, u.lowerOpen ? t.MAX_KEY : t.MIN_KEY, m), lowerOpen: !0, upper: st(u.upper, u.upperOpen ? t.MIN_KEY : t.MAX_KEY, m), upperOpen: !0 }) } } : l;
      var u, m;
    }
    return { ...n, schema: { ...r, primaryKey: o, indexes: a, getIndexByKeyPath: function(l) {
      const h = s[Fe(l)];
      return h && h[0];
    } }, count: (l) => n.count(c(l)), query: (l) => n.query(c(l)), openCursor(l) {
      const { keyTail: h, isVirtual: u, keyLength: m } = l.query.index;
      return u ? n.openCursor(c(l)).then((g) => g && function(p) {
        return Object.create(p, { continue: { value: function(y) {
          y != null ? p.continue(st(y, l.reverse ? t.MAX_KEY : t.MIN_KEY, h)) : l.unique ? p.continue(p.key.slice(0, m).concat(l.reverse ? t.MIN_KEY : t.MAX_KEY, h)) : p.continue();
        } }, continuePrimaryKey: { value(y, f) {
          p.continuePrimaryKey(st(y, t.MAX_KEY, h), f);
        } }, primaryKey: { get: () => p.primaryKey }, key: { get() {
          const y = p.key;
          return m === 1 ? y[0] : y.slice(0, m);
        } }, value: { get: () => p.value } });
      }(g)) : n.openCursor(l);
    } };
  } };
} };
function mn(t, e, n, r) {
  return n = n || {}, r = r || "", I(t).forEach((s) => {
    if (V(e, s)) {
      var a = t[s], i = e[s];
      if (typeof a == "object" && typeof i == "object" && a && i) {
        const o = Tt(a);
        o !== Tt(i) ? n[r + s] = e[s] : o === "Object" ? mn(a, i, n, r + s + ".") : a !== i && (n[r + s] = e[s]);
      } else
        a !== i && (n[r + s] = e[s]);
    } else
      n[r + s] = void 0;
  }), I(e).forEach((s) => {
    V(t, s) || (n[r + s] = e[s]);
  }), n;
}
const is = { stack: "dbcore", name: "HooksMiddleware", level: 2, create: (t) => ({ ...t, table(e) {
  const n = t.table(e), { primaryKey: r } = n.schema;
  return { ...n, mutate(a) {
    const i = P.trans, { deleting: o, creating: c, updating: d } = i.table(e).hook;
    switch (a.type) {
      case "add":
        if (c.fire === A)
          break;
        return i._promise("readwrite", () => l(a), !0);
      case "put":
        if (c.fire === A && d.fire === A)
          break;
        return i._promise("readwrite", () => l(a), !0);
      case "delete":
        if (o.fire === A)
          break;
        return i._promise("readwrite", () => l(a), !0);
      case "deleteRange":
        if (o.fire === A)
          break;
        return i._promise("readwrite", () => function(u) {
          return h(u.trans, u.range, 1e4);
        }(a), !0);
    }
    return n.mutate(a);
    function l(u) {
      const m = P.trans, g = u.keys || function(p, b) {
        return b.type === "delete" ? b.keys : b.keys || b.values.map(p.extractKey);
      }(r, u);
      if (!g)
        throw new Error("Keys missing");
      return (u = u.type === "add" || u.type === "put" ? { ...u, keys: g } : { ...u }).type !== "delete" && (u.values = [...u.values]), u.keys && (u.keys = [...u.keys]), function(p, b, y) {
        return b.type === "add" ? Promise.resolve([]) : p.getMany({ trans: b.trans, keys: y, cache: "immutable" });
      }(n, u, g).then((p) => {
        const b = g.map((y, f) => {
          const w = p[f], C = { onerror: null, onsuccess: null };
          if (u.type === "delete")
            o.fire.call(C, y, w, m);
          else if (u.type === "add" || w === void 0) {
            const E = c.fire.call(C, y, u.values[f], m);
            y == null && E != null && (y = E, u.keys[f] = y, r.outbound || G(u.values[f], r.keyPath, y));
          } else {
            const E = mn(w, u.values[f]), x = d.fire.call(C, E, y, w, m);
            if (x) {
              const v = u.values[f];
              Object.keys(x).forEach((K) => {
                V(v, K) ? v[K] = x[K] : G(v, K, x[K]);
              });
            }
          }
          return C;
        });
        return n.mutate(u).then(({ failures: y, results: f, numFailures: w, lastResult: C }) => {
          for (let E = 0; E < g.length; ++E) {
            const x = f ? f[E] : g[E], v = b[E];
            x == null ? v.onerror && v.onerror(y[E]) : v.onsuccess && v.onsuccess(u.type === "put" && p[E] ? u.values[E] : x);
          }
          return { failures: y, results: f, numFailures: w, lastResult: C };
        }).catch((y) => (b.forEach((f) => f.onerror && f.onerror(y)), Promise.reject(y)));
      });
    }
    function h(u, m, g) {
      return n.query({ trans: u, values: !1, query: { index: r, range: m }, limit: g }).then(({ result: p }) => l({ type: "delete", keys: p, trans: u }).then((b) => b.numFailures > 0 ? Promise.reject(b.failures[0]) : p.length < g ? { failures: [], numFailures: 0, lastResult: void 0 } : h(u, { ...m, lower: p[p.length - 1], lowerOpen: !0 }, g)));
    }
  } };
} }) };
function or(t, e, n) {
  try {
    if (!e || e.keys.length < t.length)
      return null;
    const r = [];
    for (let s = 0, a = 0; s < e.keys.length && a < t.length; ++s)
      L(e.keys[s], t[a]) === 0 && (r.push(n ? Ye(e.values[s]) : e.values[s]), ++a);
    return r.length === t.length ? r : null;
  } catch {
    return null;
  }
}
const os = { stack: "dbcore", level: -1, create: (t) => ({ table: (e) => {
  const n = t.table(e);
  return { ...n, getMany: (r) => {
    if (!r.cache)
      return n.getMany(r);
    const s = or(r.keys, r.trans._cache, r.cache === "clone");
    return s ? S.resolve(s) : n.getMany(r).then((a) => (r.trans._cache = { keys: r.keys, values: r.cache === "clone" ? Ye(a) : a }, a));
  }, mutate: (r) => (r.type !== "add" && (r.trans._cache = null), n.mutate(r)) };
} }) };
function yn(t) {
  return !("from" in t);
}
const J = function(t, e) {
  if (!this) {
    const n = new J();
    return t && "d" in t && $(n, t), n;
  }
  $(this, arguments.length ? { d: 1, from: t, to: arguments.length > 1 ? e : t } : { d: 0 });
};
function ze(t, e, n) {
  const r = L(e, n);
  if (isNaN(r))
    return;
  if (r > 0)
    throw RangeError();
  if (yn(t))
    return $(t, { from: e, to: n, d: 1 });
  const s = t.l, a = t.r;
  if (L(n, t.from) < 0)
    return s ? ze(s, e, n) : t.l = { from: e, to: n, d: 1, l: null, r: null }, Rn(t);
  if (L(e, t.to) > 0)
    return a ? ze(a, e, n) : t.r = { from: e, to: n, d: 1, l: null, r: null }, Rn(t);
  L(e, t.from) < 0 && (t.from = e, t.l = null, t.d = a ? a.d + 1 : 1), L(n, t.to) > 0 && (t.to = n, t.r = null, t.d = t.l ? t.l.d + 1 : 1);
  const i = !t.r;
  s && !t.l && wt(t, s), a && i && wt(t, a);
}
function wt(t, e) {
  yn(e) || function n(r, { from: s, to: a, l: i, r: o }) {
    ze(r, s, a), i && n(r, i), o && n(r, o);
  }(t, e);
}
function cs(t, e) {
  const n = nn(e);
  let r = n.next();
  if (r.done)
    return !1;
  let s = r.value;
  const a = nn(t);
  let i = a.next(s.from), o = i.value;
  for (; !r.done && !i.done; ) {
    if (L(o.from, s.to) <= 0 && L(o.to, s.from) >= 0)
      return !0;
    L(s.from, o.from) < 0 ? s = (r = n.next(o.from)).value : o = (i = a.next(s.from)).value;
  }
  return !1;
}
function nn(t) {
  let e = yn(t) ? null : { s: 0, n: t };
  return { next(n) {
    const r = arguments.length > 0;
    for (; e; )
      switch (e.s) {
        case 0:
          if (e.s = 1, r)
            for (; e.n.l && L(n, e.n.from) < 0; )
              e = { up: e, n: e.n.l, s: 1 };
          else
            for (; e.n.l; )
              e = { up: e, n: e.n.l, s: 1 };
        case 1:
          if (e.s = 2, !r || L(n, e.n.to) <= 0)
            return { value: e.n, done: !1 };
        case 2:
          if (e.n.r) {
            e.s = 3, e = { up: e, n: e.n.r, s: 0 };
            continue;
          }
        case 3:
          e = e.up;
      }
    return { done: !0 };
  } };
}
function Rn(t) {
  var e, n;
  const r = (((e = t.r) === null || e === void 0 ? void 0 : e.d) || 0) - (((n = t.l) === null || n === void 0 ? void 0 : n.d) || 0), s = r > 1 ? "r" : r < -1 ? "l" : "";
  if (s) {
    const a = s === "r" ? "l" : "r", i = { ...t }, o = t[s];
    t.from = o.from, t.to = o.to, t[s] = o[s], i[s] = o[a], t[a] = i, i.d = Kn(i);
  }
  t.d = Kn(t);
}
function Kn({ r: t, l: e }) {
  return (t ? e ? Math.max(t.d, e.d) : t.d : e ? e.d : 0) + 1;
}
Re(J.prototype, { add(t) {
  return wt(this, t), this;
}, addKey(t) {
  return ze(this, t, t), this;
}, addKeys(t) {
  return t.forEach((e) => ze(this, e, e)), this;
}, [Bt]() {
  return nn(this);
} });
const ls = { stack: "dbcore", level: 0, create: (t) => {
  const e = t.schema.name, n = new J(t.MIN_KEY, t.MAX_KEY);
  return { ...t, table: (r) => {
    const s = t.table(r), { schema: a } = s, { primaryKey: i } = a, { extractKey: o, outbound: c } = i, d = { ...s, mutate: (u) => {
      const m = u.trans, g = m.mutatedParts || (m.mutatedParts = {}), p = (x) => {
        const v = `idb://${e}/${r}/${x}`;
        return g[v] || (g[v] = new J());
      }, b = p(""), y = p(":dels"), { type: f } = u;
      let [w, C] = u.type === "deleteRange" ? [u.range] : u.type === "delete" ? [u.keys] : u.values.length < 50 ? [[], u.values] : [];
      const E = u.trans._cache;
      return s.mutate(u).then((x) => {
        if (F(w)) {
          f !== "delete" && (w = x.results), b.addKeys(w);
          const v = or(w, E);
          v || f === "add" || y.addKeys(w), (v || C) && function(K, k, T, O) {
            function U(N) {
              const B = K(N.name || "");
              function we(W) {
                return W != null ? N.extractKey(W) : null;
              }
              const _e = (W) => N.multiEntry && F(W) ? W.forEach((ue) => B.addKey(ue)) : B.addKey(W);
              (T || O).forEach((W, ue) => {
                const Ae = T && we(T[ue]), Et = O && we(O[ue]);
                L(Ae, Et) !== 0 && (Ae != null && _e(Ae), Et != null && _e(Et));
              });
            }
            k.indexes.forEach(U);
          }(p, a, v, C);
        } else if (w) {
          const v = { from: w.lower, to: w.upper };
          y.add(v), b.add(v);
        } else
          b.add(n), y.add(n), a.indexes.forEach((v) => p(v.name).add(n));
        return x;
      });
    } }, l = ({ query: { index: u, range: m } }) => {
      var g, p;
      return [u, new J((g = m.lower) !== null && g !== void 0 ? g : t.MIN_KEY, (p = m.upper) !== null && p !== void 0 ? p : t.MAX_KEY)];
    }, h = { get: (u) => [i, new J(u.key)], getMany: (u) => [i, new J().addKeys(u.keys)], count: l, query: l, openCursor: l };
    return I(h).forEach((u) => {
      d[u] = function(m) {
        const { subscr: g } = P;
        if (g) {
          const p = (C) => {
            const E = `idb://${e}/${r}/${C}`;
            return g[E] || (g[E] = new J());
          }, b = p(""), y = p(":dels"), [f, w] = h[u](m);
          if (p(f.name || "").add(w), !f.isPrimaryKey) {
            if (u !== "count") {
              const C = u === "query" && c && m.values && s.query({ ...m, values: !1 });
              return s[u].apply(this, arguments).then((E) => {
                if (u === "query") {
                  if (c && m.values)
                    return C.then(({ result: v }) => (b.addKeys(v), E));
                  const x = m.values ? E.result.map(o) : E.result;
                  m.values ? b.addKeys(x) : y.addKeys(x);
                } else if (u === "openCursor") {
                  const x = E, v = m.values;
                  return x && Object.create(x, { key: { get: () => (y.addKey(x.primaryKey), x.key) }, primaryKey: { get() {
                    const K = x.primaryKey;
                    return y.addKey(K), K;
                  } }, value: { get: () => (v && b.addKey(x.primaryKey), x.value) } });
                }
                return E;
              });
            }
            y.add(n);
          }
        }
        return s[u].apply(this, arguments);
      };
    }), d;
  } };
} };
class me {
  constructor(e, n) {
    this._middlewares = {}, this.verno = 0;
    const r = me.dependencies;
    this._options = n = { addons: me.addons, autoOpen: !0, indexedDB: r.indexedDB, IDBKeyRange: r.IDBKeyRange, ...n }, this._deps = { indexedDB: n.indexedDB, IDBKeyRange: n.IDBKeyRange };
    const { addons: s } = n;
    this._dbSchema = {}, this._versions = [], this._storeNames = [], this._allTables = {}, this.idbdb = null, this._novip = this;
    const a = { dbOpenError: null, isBeingOpened: !1, onReadyBeingFired: null, openComplete: !1, dbReadyResolve: A, dbReadyPromise: null, cancelOpen: A, openCanceller: null, autoSchema: !0, PR1398_maxLoop: 3 };
    var i;
    a.dbReadyPromise = new S((o) => {
      a.dbReadyResolve = o;
    }), a.openCanceller = new S((o, c) => {
      a.cancelOpen = c;
    }), this._state = a, this.name = e, this.on = qe(this, "populate", "blocked", "versionchange", "close", { ready: [ln, A] }), this.on.ready.subscribe = Dn(this.on.ready.subscribe, (o) => (c, d) => {
      me.vip(() => {
        const l = this._state;
        if (l.openComplete)
          l.dbOpenError || S.resolve().then(c), d && o(c);
        else if (l.onReadyBeingFired)
          l.onReadyBeingFired.push(c), d && o(c);
        else {
          o(c);
          const h = this;
          d || o(function u() {
            h.on.ready.unsubscribe(c), h.on.ready.unsubscribe(u);
          });
        }
      });
    }), this.Collection = (i = this, je(Vr.prototype, function(o, c) {
      this.db = i;
      let d = er, l = null;
      if (c)
        try {
          d = c();
        } catch (g) {
          l = g;
        }
      const h = o._ctx, u = h.table, m = u.hook.reading.fire;
      this._ctx = { table: u, index: h.index, isPrimKey: !h.index || u.schema.primKey.keyPath && h.index === u.schema.primKey.name, range: d, keysOnly: !1, dir: "next", unique: "", algorithm: null, filter: null, replayFilter: null, justLimit: !0, isMatch: null, offset: 0, limit: 1 / 0, error: l, or: h.or, valueMapper: m !== $e ? m : null };
    })), this.Table = function(o) {
      return je(Hr.prototype, function(c, d, l) {
        this.db = o, this._tx = l, this.name = c, this.schema = d, this.hook = o._allTables[c] ? o._allTables[c].hook : qe(null, { creating: [Dr, A], reading: [jr, $e], updating: [Br, A], deleting: [Tr, A] });
      });
    }(this), this.Transaction = function(o) {
      return je(Qr.prototype, function(c, d, l, h, u) {
        this.db = o, this.mode = c, this.storeNames = d, this.schema = l, this.chromeTransactionDurability = h, this.idbtrans = null, this.on = qe(this, "complete", "error", "abort"), this.parent = u || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new S((m, g) => {
          this._resolve = m, this._reject = g;
        }), this._completion.then(() => {
          this.active = !1, this.on.complete.fire();
        }, (m) => {
          var g = this.active;
          return this.active = !1, this.on.error.fire(m), this.parent ? this.parent._reject(m) : g && this.idbtrans && this.idbtrans.abort(), M(m);
        });
      });
    }(this), this.Version = function(o) {
      return je(ts.prototype, function(c) {
        this.db = o, this._cfg = { version: c, storesSource: null, dbschema: {}, tables: {}, contentUpgrade: null };
      });
    }(this), this.WhereClause = function(o) {
      return je(nr.prototype, function(c, d, l) {
        this.db = o, this._ctx = { table: c, index: d === ":id" ? null : d, or: l };
        const h = o._deps.indexedDB;
        if (!h)
          throw new R.MissingAPI();
        this._cmp = this._ascending = h.cmp.bind(h), this._descending = (u, m) => h.cmp(m, u), this._max = (u, m) => h.cmp(u, m) > 0 ? u : m, this._min = (u, m) => h.cmp(u, m) < 0 ? u : m, this._IDBKeyRange = o._deps.IDBKeyRange;
      });
    }(this), this.on("versionchange", (o) => {
      o.newVersion > 0 ? console.warn(`Another connection wants to upgrade database '${this.name}'. Closing db now to resume the upgrade.`) : console.warn(`Another connection wants to delete database '${this.name}'. Closing db now to resume the delete request.`), this.close();
    }), this.on("blocked", (o) => {
      !o.newVersion || o.newVersion < o.oldVersion ? console.warn(`Dexie.delete('${this.name}') was blocked`) : console.warn(`Upgrade '${this.name}' blocked by other connection holding version ${o.oldVersion / 10}`);
    }), this._maxKey = Ge(n.IDBKeyRange), this._createTransaction = (o, c, d, l) => new this.Transaction(o, c, d, this._options.chromeTransactionDurability, l), this._fireOnBlocked = (o) => {
      this.on("blocked").fire(o), Ne.filter((c) => c.name === this.name && c !== this && !c._state.vcFired).map((c) => c.on("versionchange").fire(o));
    }, this.use(as), this.use(is), this.use(ls), this.use(os), this.vip = Object.create(this, { _vip: { value: !0 } }), s.forEach((o) => o(this));
  }
  version(e) {
    if (isNaN(e) || e < 0.1)
      throw new R.Type("Given version is not a positive number");
    if (e = Math.round(10 * e) / 10, this.idbdb || this._state.isBeingOpened)
      throw new R.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, e);
    const n = this._versions;
    var r = n.filter((s) => s._cfg.version === e)[0];
    return r || (r = new this.Version(e), n.push(r), n.sort(Zr), r.stores({}), this._state.autoSchema = !1, r);
  }
  _whenReady(e) {
    return this.idbdb && (this._state.openComplete || P.letThrough || this._vip) ? e() : new S((n, r) => {
      if (this._state.openComplete)
        return r(new R.DatabaseClosed(this._state.dbOpenError));
      if (!this._state.isBeingOpened) {
        if (!this._options.autoOpen)
          return void r(new R.DatabaseClosed());
        this.open().catch(A);
      }
      this._state.dbReadyPromise.then(n, r);
    }).then(e);
  }
  use({ stack: e, create: n, level: r, name: s }) {
    s && this.unuse({ stack: e, name: s });
    const a = this._middlewares[e] || (this._middlewares[e] = []);
    return a.push({ stack: e, create: n, level: r ?? 10, name: s }), a.sort((i, o) => i.level - o.level), this;
  }
  unuse({ stack: e, name: n, create: r }) {
    return e && this._middlewares[e] && (this._middlewares[e] = this._middlewares[e].filter((s) => r ? s.create !== r : !!n && s.name !== n)), this;
  }
  open() {
    return rs(this);
  }
  _close() {
    const e = this._state, n = Ne.indexOf(this);
    if (n >= 0 && Ne.splice(n, 1), this.idbdb) {
      try {
        this.idbdb.close();
      } catch {
      }
      this._novip.idbdb = null;
    }
    e.dbReadyPromise = new S((r) => {
      e.dbReadyResolve = r;
    }), e.openCanceller = new S((r, s) => {
      e.cancelOpen = s;
    });
  }
  close() {
    this._close();
    const e = this._state;
    this._options.autoOpen = !1, e.dbOpenError = new R.DatabaseClosed(), e.isBeingOpened && e.cancelOpen(e.dbOpenError);
  }
  delete() {
    const e = arguments.length > 0, n = this._state;
    return new S((r, s) => {
      const a = () => {
        this.close();
        var i = this._deps.indexedDB.deleteDatabase(this.name);
        i.onsuccess = D(() => {
          (function({ indexedDB: o, IDBKeyRange: c }, d) {
            !pn(o) && d !== xt && fn(o, c).delete(d).catch(A);
          })(this._deps, this.name), r();
        }), i.onerror = z(s), i.onblocked = this._fireOnBlocked;
      };
      if (e)
        throw new R.InvalidArgument("Arguments not allowed in db.delete()");
      n.isBeingOpened ? n.dbReadyPromise.then(a) : a();
    });
  }
  backendDB() {
    return this.idbdb;
  }
  isOpen() {
    return this.idbdb !== null;
  }
  hasBeenClosed() {
    const e = this._state.dbOpenError;
    return e && e.name === "DatabaseClosed";
  }
  hasFailed() {
    return this._state.dbOpenError !== null;
  }
  dynamicallyOpened() {
    return this._state.autoSchema;
  }
  get tables() {
    return I(this._allTables).map((e) => this._allTables[e]);
  }
  transaction() {
    const e = ss.apply(this, arguments);
    return this._transaction.apply(this, e);
  }
  _transaction(e, n, r) {
    let s = P.trans;
    s && s.db === this && e.indexOf("!") === -1 || (s = null);
    const a = e.indexOf("?") !== -1;
    let i, o;
    e = e.replace("!", "").replace("?", "");
    try {
      if (o = n.map((d) => {
        var l = d instanceof this.Table ? d.name : d;
        if (typeof l != "string")
          throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return l;
      }), e == "r" || e === Pt)
        i = Pt;
      else {
        if (e != "rw" && e != Rt)
          throw new R.InvalidArgument("Invalid transaction mode: " + e);
        i = Rt;
      }
      if (s) {
        if (s.mode === Pt && i === Rt) {
          if (!a)
            throw new R.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
          s = null;
        }
        s && o.forEach((d) => {
          if (s && s.storeNames.indexOf(d) === -1) {
            if (!a)
              throw new R.SubTransaction("Table " + d + " not included in parent transaction.");
            s = null;
          }
        }), a && s && !s.active && (s = null);
      }
    } catch (d) {
      return s ? s._promise(null, (l, h) => {
        h(d);
      }) : M(d);
    }
    const c = ir.bind(null, this, i, o, s, r);
    return s ? s._promise(i, c, "lock") : P.trans ? Oe(P.transless, () => this._whenReady(c)) : this._whenReady(c);
  }
  table(e) {
    if (!V(this._allTables, e))
      throw new R.InvalidTable(`Table ${e} does not exist`);
    return this._allTables[e];
  }
}
const us = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable";
class hs {
  constructor(e) {
    this._subscribe = e;
  }
  subscribe(e, n, r) {
    return this._subscribe(e && typeof e != "function" ? e : { next: e, error: n, complete: r });
  }
  [us]() {
    return this;
  }
}
function cr(t, e) {
  return I(e).forEach((n) => {
    wt(t[n] || (t[n] = new J()), e[n]);
  }), t;
}
function ds(t) {
  let e, n = !1;
  const r = new hs((s) => {
    const a = an(t);
    let i = !1, o = {}, c = {};
    const d = { get closed() {
      return i;
    }, unsubscribe: () => {
      i = !0, le.storagemutated.unsubscribe(m);
    } };
    s.start && s.start(d);
    let l = !1, h = !1;
    function u() {
      return I(c).some((p) => o[p] && cs(o[p], c[p]));
    }
    const m = (p) => {
      cr(o, p), u() && g();
    }, g = () => {
      if (l || i)
        return;
      o = {};
      const p = {}, b = function(y) {
        a && Ke();
        const f = () => oe(t, { subscr: y, trans: null }), w = P.trans ? Oe(P.transless, f) : f();
        return a && w.then(re, re), w;
      }(p);
      h || (le(Ve, m), h = !0), l = !0, Promise.resolve(b).then((y) => {
        n = !0, e = y, l = !1, i || (u() ? g() : (o = {}, c = p, s.next && s.next(y)));
      }, (y) => {
        l = !1, n = !1, s.error && s.error(y), d.unsubscribe();
      });
    };
    return g(), d;
  });
  return r.hasValue = () => n, r.getValue = () => e, r;
}
let rn;
try {
  rn = { indexedDB: j.indexedDB || j.mozIndexedDB || j.webkitIndexedDB || j.msIndexedDB, IDBKeyRange: j.IDBKeyRange || j.webkitIDBKeyRange };
} catch {
  rn = { indexedDB: null, IDBKeyRange: null };
}
const he = me;
function dt(t) {
  let e = ee;
  try {
    ee = !0, le.storagemutated.fire(t);
  } finally {
    ee = e;
  }
}
Re(he, { ...it, delete: (t) => new he(t, { addons: [] }).delete(), exists: (t) => new he(t, { addons: [] }).open().then((e) => (e.close(), !0)).catch("NoSuchDatabaseError", () => !1), getDatabaseNames(t) {
  try {
    return function({ indexedDB: e, IDBKeyRange: n }) {
      return pn(e) ? Promise.resolve(e.databases()).then((r) => r.map((s) => s.name).filter((s) => s !== xt)) : fn(e, n).toCollection().primaryKeys();
    }(he.dependencies).then(t);
  } catch {
    return M(new R.MissingAPI());
  }
}, defineClass: () => function(t) {
  $(this, t);
}, ignoreTransaction: (t) => P.trans ? Oe(P.transless, t) : t(), vip: en, async: function(t) {
  return function() {
    try {
      var e = tn(t.apply(this, arguments));
      return e && typeof e.then == "function" ? e : S.resolve(e);
    } catch (n) {
      return M(n);
    }
  };
}, spawn: function(t, e, n) {
  try {
    var r = tn(t.apply(n, e || []));
    return r && typeof r.then == "function" ? r : S.resolve(r);
  } catch (s) {
    return M(s);
  }
}, currentTransaction: { get: () => P.trans || null }, waitFor: function(t, e) {
  const n = S.resolve(typeof t == "function" ? he.ignoreTransaction(t) : t).timeout(e || 6e4);
  return P.trans ? P.trans.waitFor(n) : n;
}, Promise: S, debug: { get: () => Y, set: (t) => {
  qn(t, t === "dexie" ? () => !0 : Zn);
} }, derive: Se, extend: $, props: Re, override: Dn, Events: qe, on: le, liveQuery: ds, extendObservabilitySet: cr, getByKeyPath: ne, setByKeyPath: G, delByKeyPath: function(t, e) {
  typeof e == "string" ? G(t, e, void 0) : "length" in e && [].map.call(e, function(n) {
    G(t, n, void 0);
  });
}, shallowClone: In, deepClone: Ye, getObjectDiff: mn, cmp: L, asap: Tn, minKey: Vt, addons: [], connections: Ne, errnames: cn, dependencies: rn, semVer: kn, version: kn.split(".").map((t) => parseInt(t)).reduce((t, e, n) => t + e / Math.pow(10, 2 * n)) }), he.maxKey = Ge(he.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (le(Ve, (t) => {
  if (!ee) {
    let e;
    kt ? (e = document.createEvent("CustomEvent"), e.initCustomEvent(ie, !0, !0, t)) : e = new CustomEvent(ie, { detail: t }), ee = !0, dispatchEvent(e), ee = !1;
  }
}), addEventListener(ie, ({ detail: t }) => {
  ee || dt(t);
}));
let ee = !1;
if (typeof BroadcastChannel < "u") {
  const t = new BroadcastChannel(ie);
  typeof t.unref == "function" && t.unref(), le(Ve, (e) => {
    ee || t.postMessage(e);
  }), t.onmessage = (e) => {
    e.data && dt(e.data);
  };
} else if (typeof self < "u" && typeof navigator < "u") {
  le(Ve, (e) => {
    try {
      ee || (typeof localStorage < "u" && localStorage.setItem(ie, JSON.stringify({ trig: Math.random(), changedParts: e })), typeof self.clients == "object" && [...self.clients.matchAll({ includeUncontrolled: !0 })].forEach((n) => n.postMessage({ type: ie, changedParts: e })));
    } catch {
    }
  }), typeof addEventListener < "u" && addEventListener("storage", (e) => {
    if (e.key === ie) {
      const n = JSON.parse(e.newValue);
      n && dt(n.changedParts);
    }
  });
  const t = self.document && navigator.serviceWorker;
  t && t.addEventListener("message", function({ data: e }) {
    e && e.type === ie && dt(e.changedParts);
  });
}
S.rejectionMapper = function(t, e) {
  if (!t || t instanceof Ce || t instanceof TypeError || t instanceof SyntaxError || !t.name || !bn[t.name])
    return t;
  var n = new bn[t.name](e || t.message, t);
  return "stack" in t && te(n, "stack", { get: function() {
    return this.inner.stack;
  } }), n;
}, qn(Y, Zn);
class fs extends me {
  constructor() {
    super("QspiderDatabase"), this.version(2).stores({
      games: "id, title",
      gameResources: "++, game_id, &[game_id+path]",
      gameSaves: "++, game_id, &[game_id+key+slot], slot, [game_id+slot], [game_id+key]"
    });
  }
}
class ps {
  constructor() {
    this.db = new fs();
  }
  async prepareLoadConfig(e, n) {
    return {
      url: `/qspider-files/${e}/`,
      entrypoint: n
    };
  }
  async getGames() {
    return (await this.db.games.toArray()).reduce((n, r) => (n[r.id] = r, n), {});
  }
  async addGame(e, n) {
    await this.db.games.put(n, e);
  }
  async updateGame(e, n) {
    await this.db.games.update(e, n);
  }
  async removeGame(e) {
    await this.db.transaction("rw", this.db.games, this.db.gameResources, async () => {
      await this.db.games.delete(e), await this.db.gameResources.where("game_id").equals(e).delete();
    });
  }
  async addGameResource(e, n, r) {
    const s = n.toLowerCase();
    await this.db.gameResources.where({
      game_id: e,
      path: s
    }).delete(), await this.db.gameResources.put({
      game_id: e,
      path: s,
      content: r
    });
  }
  async getGameResource(e, n) {
    const r = n.toLowerCase(), s = await this.db.gameResources.where({ game_id: e, path: r }).first();
    return (s == null ? void 0 : s.content) || null;
  }
  async saveByKey(e, n, r) {
    await this.db.gameSaves.where({
      game_id: e,
      key: n,
      slot: -1
    }).delete();
    const s = {
      timestamp: Date.now(),
      game_id: e,
      key: n,
      slot: -1,
      data: r
    };
    await this.db.gameSaves.put(s);
  }
  async saveBySlot(e, n, r) {
    await this.db.gameSaves.where({
      game_id: e,
      key: "",
      slot: n
    }).delete();
    const s = {
      timestamp: Date.now(),
      game_id: e,
      key: "",
      slot: n,
      data: r
    };
    await this.db.gameSaves.put(s);
  }
  async hasSaveByKey(e, n) {
    return await this.db.gameSaves.where({ game_id: e, key: n }).count() > 0;
  }
  async hasSaveBySlot(e, n) {
    return await this.db.gameSaves.where({ game_id: e, slot: n }).count() > 0;
  }
  async getSaveDataByKey(e, n) {
    const r = await this.db.gameSaves.where({ game_id: e, key: n }).first();
    return (r == null ? void 0 : r.data) || null;
  }
  async getSaveDataBySlot(e, n) {
    const r = await this.db.gameSaves.where({ game_id: e, slot: n }).first();
    return (r == null ? void 0 : r.data) || null;
  }
  async getSavedSlots(e) {
    return await this.db.gameSaves.where({ game_id: e }).and((n) => n.slot > 0).toArray();
  }
  async getNamedSaves(e) {
    return await this.db.gameSaves.where({ game_id: e }).and((n) => n.key !== "").toArray();
  }
  async clearSaveSlot(e, n) {
    await this.db.gameSaves.where({
      game_id: e,
      key: "",
      slot: n
    }).delete();
  }
  async clearSaveKey(e, n) {
    await this.db.gameSaves.where({
      game_id: e,
      key: n,
      slot: -1
    }).delete();
  }
}
try {
  self["workbox:strategies:7.0.0"] && _();
} catch {
}
function at(t) {
  return typeof t == "string" ? new Request(t) : t;
}
class ms {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, n) {
    this._cacheKeys = {}, Object.assign(this, n), this.event = n.event, this._strategy = e, this._handlerDeferred = new br(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const r of this._plugins)
      this._pluginStateMap.set(r, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: n } = this;
    let r = at(e);
    if (r.mode === "navigate" && n instanceof FetchEvent && n.preloadResponse) {
      const i = await n.preloadResponse;
      if (i)
        return i;
    }
    const s = this.hasCallback("fetchDidFail") ? r.clone() : null;
    try {
      for (const i of this.iterateCallbacks("requestWillFetch"))
        r = await i({ request: r.clone(), event: n });
    } catch (i) {
      if (i instanceof Error)
        throw new ye("plugin-error-request-will-fetch", {
          thrownErrorMessage: i.message
        });
    }
    const a = r.clone();
    try {
      let i;
      i = await fetch(r, r.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const o of this.iterateCallbacks("fetchDidSucceed"))
        i = await o({
          event: n,
          request: a,
          response: i
        });
      return i;
    } catch (i) {
      throw s && await this.runCallbacks("fetchDidFail", {
        error: i,
        event: n,
        originalRequest: s.clone(),
        request: a.clone()
      }), i;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const n = await this.fetch(e), r = n.clone();
    return this.waitUntil(this.cachePut(e, r)), n;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cachedResponseWillByUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const n = at(e);
    let r;
    const { cacheName: s, matchOptions: a } = this._strategy, i = await this.getCacheKey(n, "read"), o = Object.assign(Object.assign({}, a), { cacheName: s });
    r = await caches.match(i, o);
    for (const c of this.iterateCallbacks("cachedResponseWillBeUsed"))
      r = await c({
        cacheName: s,
        matchOptions: a,
        cachedResponse: r,
        request: i,
        event: this.event
      }) || void 0;
    return r;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, n) {
    const r = at(e);
    await An(0);
    const s = await this.getCacheKey(r, "write");
    if (!n)
      throw new ye("cache-put-with-no-response", {
        url: wr(s.url)
      });
    const a = await this._ensureResponseSafeToCache(n);
    if (!a)
      return !1;
    const { cacheName: i, matchOptions: o } = this._strategy, c = await self.caches.open(i), d = this.hasCallback("cacheDidUpdate"), l = d ? await gr(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      c,
      s.clone(),
      ["__WB_REVISION__"],
      o
    ) : null;
    try {
      await c.put(s, d ? a.clone() : a);
    } catch (h) {
      if (h instanceof Error)
        throw h.name === "QuotaExceededError" && await vr(), h;
    }
    for (const h of this.iterateCallbacks("cacheDidUpdate"))
      await h({
        cacheName: i,
        oldResponse: l,
        newResponse: a.clone(),
        request: s,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, n) {
    const r = `${e.url} | ${n}`;
    if (!this._cacheKeys[r]) {
      let s = e;
      for (const a of this.iterateCallbacks("cacheKeyWillBeUsed"))
        s = at(await a({
          mode: n,
          request: s,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[r] = s;
    }
    return this._cacheKeys[r];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const n of this._strategy.plugins)
      if (e in n)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, n) {
    for (const r of this.iterateCallbacks(e))
      await r(n);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const n of this._strategy.plugins)
      if (typeof n[e] == "function") {
        const r = this._pluginStateMap.get(n);
        yield (a) => {
          const i = Object.assign(Object.assign({}, a), { state: r });
          return n[e](i);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let n = e, r = !1;
    for (const s of this.iterateCallbacks("cacheWillUpdate"))
      if (n = await s({
        request: this.request,
        response: n,
        event: this.event
      }) || void 0, r = !0, !n)
        break;
    return r || n && n.status !== 200 && (n = void 0), n;
  }
}
class lr {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = yr.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [n] = this.handleAll(e);
    return n;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const n = e.event, r = typeof e.request == "string" ? new Request(e.request) : e.request, s = "params" in e ? e.params : void 0, a = new ms(this, { event: n, request: r, params: s }), i = this._getResponse(a, r, n), o = this._awaitComplete(i, a, r, n);
    return [i, o];
  }
  async _getResponse(e, n, r) {
    await e.runCallbacks("handlerWillStart", { event: r, request: n });
    let s;
    try {
      if (s = await this._handle(n, e), !s || s.type === "error")
        throw new ye("no-response", { url: n.url });
    } catch (a) {
      if (a instanceof Error) {
        for (const i of e.iterateCallbacks("handlerDidError"))
          if (s = await i({ error: a, event: r, request: n }), s)
            break;
      }
      if (!s)
        throw a;
    }
    for (const a of e.iterateCallbacks("handlerWillRespond"))
      s = await a({ event: r, request: n, response: s });
    return s;
  }
  async _awaitComplete(e, n, r, s) {
    let a, i;
    try {
      a = await e;
    } catch {
    }
    try {
      await n.runCallbacks("handlerDidRespond", {
        event: s,
        request: r,
        response: a
      }), await n.doneWaiting();
    } catch (o) {
      o instanceof Error && (i = o);
    }
    if (await n.runCallbacks("handlerDidComplete", {
      event: s,
      request: r,
      response: a,
      error: i
    }), n.destroy(), i)
      throw i;
  }
}
class ys extends lr {
  /**
   * @param {Object} [options]
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {number} [options.networkTimeoutSeconds] If set, any network requests
   * that fail to respond within the timeout will result in a network error.
   */
  constructor(e = {}) {
    super(e), this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0;
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, n) {
    let r, s;
    try {
      const a = [
        n.fetch(e)
      ];
      if (this._networkTimeoutSeconds) {
        const i = An(this._networkTimeoutSeconds * 1e3);
        a.push(i);
      }
      if (s = await Promise.race(a), !s)
        throw new Error(`Timed out the network response after ${this._networkTimeoutSeconds} seconds.`);
    } catch (a) {
      a instanceof Error && (r = a);
    }
    if (!s)
      throw new ye("no-response", { url: e.url, error: r });
    return s;
  }
}
try {
  self["workbox:routing:7.0.0"] && _();
} catch {
}
const ur = "GET", _t = (t) => t && typeof t == "object" ? t : { handle: t };
class Ue {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, n, r = ur) {
    this.handler = _t(n), this.match = e, this.method = r;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = _t(e);
  }
}
class gs extends Ue {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, n, r) {
    const s = ({ url: a }) => {
      const i = e.exec(a.href);
      if (i && !(a.origin !== location.origin && i.index !== 0))
        return i.slice(1);
    };
    super(s, n, r);
  }
}
class bs {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: n } = e, r = this.handleRequest({ request: n, event: e });
      r && e.respondWith(r);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: n } = e.data, r = Promise.all(n.urlsToCache.map((s) => {
          typeof s == "string" && (s = [s]);
          const a = new Request(...s);
          return this.handleRequest({ request: a, event: e });
        }));
        e.waitUntil(r), e.ports && e.ports[0] && r.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: n }) {
    const r = new URL(e.url, location.href);
    if (!r.protocol.startsWith("http"))
      return;
    const s = r.origin === location.origin, { params: a, route: i } = this.findMatchingRoute({
      event: n,
      request: e,
      sameOrigin: s,
      url: r
    });
    let o = i && i.handler;
    const c = e.method;
    if (!o && this._defaultHandlerMap.has(c) && (o = this._defaultHandlerMap.get(c)), !o)
      return;
    let d;
    try {
      d = o.handle({ url: r, request: e, event: n, params: a });
    } catch (h) {
      d = Promise.reject(h);
    }
    const l = i && i.catchHandler;
    return d instanceof Promise && (this._catchHandler || l) && (d = d.catch(async (h) => {
      if (l)
        try {
          return await l.handle({ url: r, request: e, event: n, params: a });
        } catch (u) {
          u instanceof Error && (h = u);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({ url: r, request: e, event: n });
      throw h;
    })), d;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: n, request: r, event: s }) {
    const a = this._routes.get(r.method) || [];
    for (const i of a) {
      let o;
      const c = i.match({ url: e, sameOrigin: n, request: r, event: s });
      if (c)
        return o = c, (Array.isArray(o) && o.length === 0 || c.constructor === Object && // eslint-disable-line
        Object.keys(c).length === 0 || typeof c == "boolean") && (o = void 0), { route: i, params: o };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, n = ur) {
    this._defaultHandlerMap.set(n, _t(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = _t(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new ye("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const n = this._routes.get(e.method).indexOf(e);
    if (n > -1)
      this._routes.get(e.method).splice(n, 1);
    else
      throw new ye("unregister-route-route-not-registered");
  }
}
let De;
const vs = () => (De || (De = new bs(), De.addFetchListener(), De.addCacheListener()), De);
function hr(t, e, n) {
  let r;
  if (typeof t == "string") {
    const a = new URL(t, location.href), i = ({ url: o }) => o.href === a.href;
    r = new Ue(i, e, n);
  } else if (t instanceof RegExp)
    r = new gs(t, e, n);
  else if (typeof t == "function")
    r = new Ue(t, e, n);
  else if (t instanceof Ue)
    r = t;
  else
    throw new ye("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return vs().registerRoute(r), r;
}
const On = self, ws = new ps();
_r();
On.addEventListener("install", () => {
  On.skipWaiting();
});
const _s = /\/qspider-files\/(.*?)\/(.*)/i;
class ks extends lr {
  async _handle(e, n) {
    const r = e.url.match(_s);
    if (r) {
      const [, s, a] = r, i = await ws.getGameResource(decodeURI(s), decodeURI(a));
      if (i) {
        const o = new Uint8Array(i.slice(0, 2));
        if (a.endsWith(".xml") && o[0] === 255 && o[1] === 254) {
          const d = new TextDecoder("utf-16le").decode(i);
          return new Response(d);
        }
        return new Response(i);
      } else
        return new Response(null, { status: 404 });
    }
    return await n.fetch(e);
  }
}
hr(({ request: t }) => t.url.includes("/qspider-files/"), new ks());
const xs = new Ue(({ request: t }) => t.mode === "navigate", new ys());
hr(xs);
