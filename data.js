// おまかせ用の素材。人名はすべて架空の組み合わせ。
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

const SURNAMES = ["白川", "北野", "今出川", "進藤", "朝霧", "柊", "早瀬", "七瀬", "桐島", "葛西", "日向", "宵町", "久遠", "椎名", "東雲", "御影", "相生", "雨宮", "千歳", "鳴海", "灯野", "真壁", "如月", "嵯峨"];
const GIVEN = ["透", "ひより", "湊", "冬子", "蒼", "澪", "陽向", "律", "紬", "朔", "小春", "颯", "千景", "凛", "葵", "壮真", "灯", "詩織", "悠", "環", "伊織", "すず", "健吾", "まどか"];

function randomName() {
  return `${pick(SURNAMES)} ${pick(GIVEN)}`;
}
function randomCast(n) {
  const set = new Set();
  while (set.size < n) set.add(randomName());
  return [...set];
}

const KANJI = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
function kanjiNum(n) {
  if (n <= 10) return n === 10 ? "十" : KANJI[n];
  if (n < 20) return "十" + KANJI[n - 10];
  if (n < 100) return KANJI[Math.floor(n / 10)] + "十" + (n % 10 ? KANJI[n % 10] : "");
  return "百" + (n % 100 ? kanjiNum(n % 100) : "");
}

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];
const WEEK_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
function futureDate() {
  const d = new Date();
  d.setDate(d.getDate() + randInt(30, 500));
  return d;
}

const GENRES = {
  seishun: {
    label: "青春",
    titles: [
      ["パンの匂いがする季節に", "THE SEASON SMELLS OF BREAD"],
      ["夏が終わる前に、君と", "BEFORE THE SUMMER ENDS"],
      ["放課後のプラネタリウム", "AFTER SCHOOL PLANETARIUM"],
      ["ぼくらの最終列車", "OUR LAST TRAIN"],
      ["坂の上の、まだ青い空", "THE STILL-BLUE SKY"],
      ["さよならは自転車の速さで", "GOODBYE AT BICYCLE SPEED"],
      ["銀杏並木で待ってる", "WAITING UNDER THE GINKGO"],
    ],
    taglines: [
      "あの秋、パンの匂いだけが本当のことを知っていた。",
      "言えなかったことは、全部ここに置いてきた。",
      "十七歳の僕らは、まだ何者でもなかった。",
      "この坂をのぼりきったら、きっと大人になる。",
      "忘れたくない一日が、ひとつだけある。",
    ],
    date: () => `${futureDate().getFullYear()}年 ${pick(["春", "夏", "初夏", "秋", "冬"])}、全国ロードショー`,
  },
  korean: {
    label: "韓国映画風",
    titles: [
      ["春の夜、パン屋で", "봄밤, 빵집에서"],
      ["きみの季節", "너의 계절"],
      ["さよならの温度", "안녕의 온도"],
      ["ゆっくり、遠くへ", "천천히, 멀리"],
      ["秋の手紙", "가을 편지"],
      ["ふたりの散歩道", "우리의 산책길"],
      ["最後の夏休み", "마지막 여름방학"],
    ],
    taglines: [
      "何も起きない日々が、いちばん愛おしかった。",
      "あの日の私に、会いにいく。",
      "季節はめぐっても、きみは戻らない。",
      "ありふれた午後に、奇跡はあった。",
      "ここにいたことを、誰かが覚えていてくれたら。",
    ],
    reviews: [
      ["今年いちばん静かで、いちばん泣ける。", "シネマ週報"],
      ["画面の隅々まで、愛おしい。", "映画日和"],
      ["見終わったあと、散歩がしたくなる。", "月刊スクリーン手帖"],
      ["何気ない風景が、こんなにも美しい。", "東亜キネマ通信"],
      ["静かな傑作。", "夜の映画評"],
    ],
    date: () => {
      const d = futureDate();
      return `${d.getFullYear()}年${d.getMonth() + 1}月 公開`;
    },
  },
  knoir: {
    label: "韓国ノワール",
    titles: [
      ["狼たちの街", "늑대들의 도시"],
      ["最後の取引", "마지막 거래"],
      ["沈黙の刃", "침묵의 칼날"],
      ["裏切りの夜", "배신의 밤"],
      ["獣の時間", "짐승의 시간"],
      ["名もなき証人", "이름 없는 증인"],
    ],
    taglines: [
      "生き残るのは、ただひとり。",
      "この街では、正義も金で買える。",
      "信じた瞬間、終わる。",
      "復讐は、まだ始まってもいない。",
      "最後に笑うのは、誰だ。",
    ],
    date: () => {
      const d = futureDate();
      return `${d.getFullYear()}.${d.getMonth() + 1}`;
    },
  },
  horror: {
    label: "ホラー",
    titles: [
      ["閉店時間", "CLOSING TIME"],
      ["くらやみ坂", "THE DARK SLOPE"],
      ["三番目の窓", "THE THIRD WINDOW"],
      ["ここに住んでいた", "SOMEONE LIVED HERE"],
      ["呼ぶ声", "THE CALLING"],
      ["忌み並木", "THE CURSED ROW"],
      ["返事をしてはいけない", "DON'T ANSWER"],
    ],
    taglines: [
      "その店は、百年前から一度も閉まったことがない。",
      "振り向いたら、終わり。",
      "あの窓に、誰かいる。",
      "この写真を撮ったのは、誰？",
      "夜になると、道がひとつ増える。",
    ],
    date: () => {
      const d = futureDate();
      return `${d.getMonth() + 1}.${d.getDate()} ${WEEK_EN[d.getDay()]}`;
    },
    rating: () => pick(["R15+　深夜上映のみ", "PG12　ひとりで観ないでください", "R15+"]),
  },
  suspense: {
    label: "サスペンス",
    titles: [
      ["沈黙の交差点", "SILENT CROSSING"],
      ["第七の証言", "THE SEVENTH TESTIMONY"],
      ["偽りの街角", "THE FALSE CORNER"],
      ["午前四時の目撃者", "WITNESS AT 4 A.M."],
      ["影を売る男", "THE SHADOW DEALER"],
      ["見えない境界線", "INVISIBLE LINE"],
    ],
    taglines: [
      "この街の誰もが、嘘をついている。",
      "真実は、いつもすぐそこに写っていた。",
      "残された時間は、あと72時間。",
      "犯人は、この中にいる。",
      "あなたが見ているものは、本物か。",
    ],
    date: () => {
      const d = futureDate();
      return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ROADSHOW`;
    },
  },
  romance: {
    label: "ロマンス",
    titles: [
      ["きみと、ひだまりの午後", "AN AFTERNOON WITH YOU"],
      ["百年後も、この場所で", "STILL HERE IN A HUNDRED YEARS"],
      ["恋は焼きたてのうちに", "LOVE, FRESHLY BAKED"],
      ["雨上がりのプロポーズ", "AFTER THE RAIN"],
      ["ふたりの距離、あと一歩", "ONE STEP AWAY"],
      ["月曜日のラブレター", "MONDAY LOVE LETTER"],
    ],
    taglines: [
      "運命は、いつもの帰り道に落ちていた。",
      "好きって、こんなに静かな気持ちだったんだ。",
      "あなたに会うために、この街に来た。",
      "最後の一ページは、ふたりで書こう。",
      "百回目の偶然は、もう運命でいい。",
    ],
    date: () => {
      const d = futureDate();
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEK[d.getDay()]}）公開`;
    },
  },
  sf: {
    label: "SF",
    titles: [
      ["第九惑星の街角", "CORNER OF PLANET NINE"],
      ["タイムループ・ベーカリー", "TIME LOOP BAKERY"],
      ["2099年の散歩道", "PROMENADE 2099"],
      ["オービタル・シティ", "ORBITAL CITY"],
      ["記憶転送", "MEMORY TRANSFER"],
      ["最後の地上観測員", "THE LAST OBSERVER"],
    ],
    taglines: [
      "この景色は、千年後の地球から届いた。",
      "同じ朝が、もう三百回目。",
      "人類最後の一日が、始まる。",
      "その街は、地図から消えていた。",
      "未来は、もう写っている。",
    ],
    date: () => {
      const d = futureDate();
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    },
  },
  comedy: {
    label: "コメディ",
    titles: [
      ["パン屋、はじめました（無許可）", "BAKERY WITHOUT PERMISSION"],
      ["おじさん、走る！", "RUN, OJISAN, RUN!"],
      ["となりの大騒動", "THE NEXT-DOOR CHAOS"],
      ["家族旅行は戦場だ", "FAMILY TRIP WARS"],
      ["それ、ぜんぶ勘違い！", "IT'S ALL A MISTAKE!"],
      ["史上最弱の探偵団", "THE WEAKEST DETECTIVES"],
    ],
    taglines: [
      "笑ってる場合じゃない。でも笑う。",
      "全米が困惑した。",
      "ぜったい、うまくいかない。",
      "大人のくせに、本気でふざける。",
      "今年いちばん、どうでもいい大事件。",
    ],
    date: () => {
      const d = futureDate();
      return `${d.getMonth() + 1}月${d.getDate()}日 爆笑公開！`;
    },
  },
  showa: {
    label: "昭和レトロ",
    titles: [
      ["銀杏通りの人々", "PEOPLE OF GINKGO STREET"],
      ["喫茶 夕暮れ", "CAFE YUGURE"],
      ["港町ブルース", "HARBOR TOWN BLUES"],
      ["下町人情物語", "A DOWNTOWN TALE"],
      ["さらば青春の街", "FAREWELL, YOUTH TOWN"],
      ["夜汽車", "NIGHT TRAIN"],
    ],
    taglines: [
      "あの頃、この街には夢があった。",
      "涙と笑いの、人情巨編。",
      "男は黙って、パンを焼く。",
      "ふるさとは、いつも遠くにありて。",
      "総天然色　大感動作！",
    ],
    date: () => {
      const d = futureDate();
      return `昭和${kanjiNum(d.getFullYear() - 1925)}年 ${kanjiNum(d.getMonth() + 1)}月 封切`;
    },
  },
};

function randomContent(genreKey) {
  const g = GENRES[genreKey];
  const [title, en] = pick(g.titles);
  const reviews = g.reviews ? [...g.reviews].sort(() => Math.random() - 0.5).slice(0, 2) : null;
  return {
    reviews,
    title,
    en,
    tagline: pick(g.taglines),
    cast: randomCast(randInt(3, 4)).join("、"),
    director: randomName(),
    date: g.date(),
  };
}
