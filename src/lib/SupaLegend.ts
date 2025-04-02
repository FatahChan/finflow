import { observable } from "@legendapp/state";
import { observablePersistIndexedDB } from "@legendapp/state/persist-plugins/indexeddb";
import { synced } from "@legendapp/state/sync";
import {
  configureSyncedSupabase,
  syncedSupabase,
} from "@legendapp/state/sync-plugins/supabase";
import type { Session } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

const INDEXEDDB_VERSION = 4;
const INDEXEDDB_DATABASE_NAME = "finflow-legend";

// Provide a function to generate ids locally
export const generateId = () => self.crypto.randomUUID();
configureSyncedSupabase({
  generateId,
});

export const transaction$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "transaction",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update"],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-transaction`,
        version: INDEXEDDB_VERSION,
        tableNames: ["transaction"],
      }),
      name: "transaction",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    changesSince: "last-sync",
    fieldDeleted: "deleted",
    fieldCreatedAt: "created_at",
    fieldUpdatedAt: "updated_at",
  }),
);

export const account$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "account",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update"],
    realtime: true,
    // Persist data and pending changes locally
    persist: {
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-account`,
        version: INDEXEDDB_VERSION,
        tableNames: ["account"],
      }),
      name: "account",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    changesSince: "last-sync",
    fieldDeleted: "deleted",
    fieldCreatedAt: "created_at",
    fieldUpdatedAt: "updated_at",
  }),
);

export const currency$ = observable(
  syncedSupabase({
    supabase: supabaseClient,
    collection: "currency",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    fieldId: "code",
    // Persist data and pending changes locally
    persist: {
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-currency`,
        version: INDEXEDDB_VERSION,
        tableNames: ["currency"],
      }),
      name: "currency",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  }),
);

export const sessionStore$ = observable<Session | null>(
  synced({
    initial: null,
    persist: {
      name: "session",
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-session`,
        version: INDEXEDDB_VERSION,
        tableNames: ["session"],
      }),
    },
  }),
);

export interface USDExchangeRate {
  date: string;
  usd: {
    "1inch": number;
    aave: number;
    ada: number;
    aed: number;
    afn: number;
    agix: number;
    akt: number;
    algo: number;
    all: number;
    amd: number;
    amp: number;
    ang: number;
    aoa: number;
    ape: number;
    apt: number;
    ar: number;
    arb: number;
    ars: number;
    atom: number;
    ats: number;
    aud: number;
    avax: number;
    awg: number;
    axs: number;
    azm: number;
    azn: number;
    bake: number;
    bam: number;
    bat: number;
    bbd: number;
    bch: number;
    bdt: number;
    bef: number;
    bgn: number;
    bhd: number;
    bif: number;
    bmd: number;
    bnb: number;
    bnd: number;
    bob: number;
    brl: number;
    bsd: number;
    bsv: number;
    bsw: number;
    btc: number;
    btcb: number;
    btg: number;
    btn: number;
    btt: number;
    busd: number;
    bwp: number;
    byn: number;
    byr: number;
    bzd: number;
    cad: number;
    cake: number;
    cdf: number;
    celo: number;
    cfx: number;
    chf: number;
    chz: number;
    clp: number;
    cnh: number;
    cny: number;
    comp: number;
    cop: number;
    crc: number;
    cro: number;
    crv: number;
    cspr: number;
    cuc: number;
    cup: number;
    cve: number;
    cvx: number;
    cyp: number;
    czk: number;
    dai: number;
    dash: number;
    dcr: number;
    dem: number;
    dfi: number;
    djf: number;
    dkk: number;
    doge: number;
    dop: number;
    dot: number;
    dydx: number;
    dzd: number;
    eek: number;
    egld: number;
    egp: number;
    enj: number;
    eos: number;
    ern: number;
    esp: number;
    etb: number;
    etc: number;
    eth: number;
    eur: number;
    fei: number;
    fil: number;
    fim: number;
    fjd: number;
    fkp: number;
    flow: number;
    flr: number;
    frax: number;
    frf: number;
    ftt: number;
    fxs: number;
    gala: number;
    gbp: number;
    gel: number;
    ggp: number;
    ghc: number;
    ghs: number;
    gip: number;
    gmd: number;
    gmx: number;
    gnf: number;
    gno: number;
    grd: number;
    grt: number;
    gt: number;
    gtq: number;
    gusd: number;
    gyd: number;
    hbar: number;
    hkd: number;
    hnl: number;
    hnt: number;
    hot: number;
    hrk: number;
    ht: number;
    htg: number;
    huf: number;
    icp: number;
    idr: number;
    iep: number;
    ils: number;
    imp: number;
    imx: number;
    inj: number;
    inr: number;
    iqd: number;
    irr: number;
    isk: number;
    itl: number;
    jep: number;
    jmd: number;
    jod: number;
    jpy: number;
    kas: number;
    kava: number;
    kcs: number;
    kda: number;
    kes: number;
    kgs: number;
    khr: number;
    klay: number;
    kmf: number;
    knc: number;
    kpw: number;
    krw: number;
    ksm: number;
    kwd: number;
    kyd: number;
    kzt: number;
    lak: number;
    lbp: number;
    ldo: number;
    leo: number;
    link: number;
    lkr: number;
    lrc: number;
    lrd: number;
    lsl: number;
    ltc: number;
    ltl: number;
    luf: number;
    luna: number;
    lunc: number;
    lvl: number;
    lyd: number;
    mad: number;
    mana: number;
    mbx: number;
    mdl: number;
    mga: number;
    mgf: number;
    mina: number;
    mkd: number;
    mkr: number;
    mmk: number;
    mnt: number;
    mop: number;
    mro: number;
    mru: number;
    mtl: number;
    mur: number;
    mvr: number;
    mwk: number;
    mxn: number;
    mxv: number;
    myr: number;
    mzm: number;
    mzn: number;
    nad: number;
    near: number;
    neo: number;
    nexo: number;
    nft: number;
    ngn: number;
    nio: number;
    nlg: number;
    nok: number;
    npr: number;
    nzd: number;
    okb: number;
    omr: number;
    one: number;
    op: number;
    ordi: number;
    pab: number;
    paxg: number;
    pen: number;
    pepe: number;
    pgk: number;
    php: number;
    pkr: number;
    pln: number;
    pte: number;
    pyg: number;
    qar: number;
    qnt: number;
    qtum: number;
    rol: number;
    ron: number;
    rpl: number;
    rsd: number;
    rub: number;
    rune: number;
    rvn: number;
    rwf: number;
    sand: number;
    sar: number;
    sbd: number;
    scr: number;
    sdd: number;
    sdg: number;
    sek: number;
    sgd: number;
    shib: number;
    shp: number;
    sit: number;
    skk: number;
    sle: number;
    sll: number;
    snx: number;
    sol: number;
    sos: number;
    spl: number;
    srd: number;
    srg: number;
    std: number;
    stn: number;
    stx: number;
    sui: number;
    svc: number;
    syp: number;
    szl: number;
    thb: number;
    theta: number;
    tjs: number;
    tmm: number;
    tmt: number;
    tnd: number;
    ton: number;
    top: number;
    trl: number;
    trx: number;
    try: number;
    ttd: number;
    tusd: number;
    tvd: number;
    twd: number;
    twt: number;
    tzs: number;
    uah: number;
    ugx: number;
    uni: number;
    usd: number;
    usdc: number;
    usdd: number;
    usdp: number;
    usdt: number;
    uyu: number;
    uzs: number;
    val: number;
    veb: number;
    ved: number;
    vef: number;
    ves: number;
    vet: number;
    vnd: number;
    vuv: number;
    waves: number;
    wemix: number;
    woo: number;
    wst: number;
    xaf: number;
    xag: number;
    xau: number;
    xaut: number;
    xbt: number;
    xcd: number;
    xcg: number;
    xch: number;
    xdc: number;
    xdr: number;
    xec: number;
    xem: number;
    xlm: number;
    xmr: number;
    xof: number;
    xpd: number;
    xpf: number;
    xpt: number;
    xrp: number;
    xtz: number;
    yer: number;
    zar: number;
    zec: number;
    zil: number;
    zmk: number;
    zmw: number;
    zwd: number;
    zwg: number;
    zwl: number;
  };
}

export const usdExchangeRate$ = observable(
  synced({
    get: () =>
      fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
      ).then((res) => res.json() as Promise<USDExchangeRate>),
    persist: {
      name: "usdExchangeRate",
      plugin: observablePersistIndexedDB({
        databaseName: `${INDEXEDDB_DATABASE_NAME}-usdExchangeRate`,
        version: INDEXEDDB_VERSION,
        tableNames: ["usdExchangeRate"],
      }),
    },
  }),
);
