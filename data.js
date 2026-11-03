// おまかせ用の素材。人名・映画祭名・媒体名はすべて架空。
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const chance = (p) => Math.random() < p;
const shuffled = (a) => [...a].sort(() => Math.random() - 0.5);

// ---------------------------------------------------------------------
// 人名
// ---------------------------------------------------------------------
const SURNAMES = ["白川", "北野", "今出川", "進藤", "朝霧", "柊", "早瀬", "七瀬", "桐島", "葛西", "日向", "宵町", "久遠", "椎名", "東雲", "御影",
  "相生", "雨宮", "千歳", "鳴海", "灯野", "真壁", "如月", "嵯峨", "一ノ瀬", "高槻", "水無瀬", "藤代", "春野", "冬木", "青柳", "白鳥", "黒崎",
  "望月", "小鳥遊", "霧島", "篠宮", "宇佐美", "古賀", "宮下", "森川", "瀬名", "早乙女", "神楽", "竹内", "野々宮", "沢渡", "三条", "岸辺",
  "久我", "砂原", "汐見", "夏目", "秋津", "結城", "九条", "芹沢", "浅葱", "葉山", "鷹野", "白石", "有栖川", "三輪", "伏見", "桃井"];
const GIVEN = ["透", "ひより", "湊", "冬子", "蒼", "澪", "陽向", "律", "紬", "朔", "小春", "颯", "千景", "凛", "葵", "壮真", "灯", "詩織",
  "悠", "環", "伊織", "すず", "健吾", "まどか", "柚", "陸", "芽衣", "楓", "司", "七海", "晴", "一花", "隼人", "萌", "航", "瑛太",
  "真白", "累", "結衣", "樹", "あかり", "直人", "雫", "旭", "琴音", "大和", "栞", "迅", "百合", "慧", "ゆかり", "創", "日和", "要", "小夜",
  "玲", "まひろ", "誠一郎", "ハル", "ミナ", "ジン", "レイ"];

function randomName() { return `${pick(SURNAMES)} ${pick(GIVEN)}`; }
function randomCast(n) {
  const set = new Set();
  while (set.size < n) set.add(randomName());
  const list = [...set];
  if (n >= 4 && chance(0.3)) list[list.length - 1] += pick(["（特別出演）", "（友情出演）"]);
  return list;
}
function randomStaff() {
  return { music: randomName(), photo: randomName(), edit: randomName(), art: randomName() };
}

// ---------------------------------------------------------------------
// 日付
// ---------------------------------------------------------------------
const KANJI = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
function kanjiNum(n) {
  if (n <= 10) return n === 10 ? "十" : KANJI[n];
  if (n < 20) return "十" + KANJI[n - 10];
  if (n < 100) return KANJI[Math.floor(n / 10)] + "十" + (n % 10 ? KANJI[n % 10] : "");
  return "百" + (n % 100 ? kanjiNum(n % 100) : "");
}
const WEEK = ["日", "月", "火", "水", "木", "金", "土"];
const WEEK_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_EN = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const MONTH_FR = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"];
function futureDate() { const d = new Date(); d.setDate(d.getDate() + randInt(30, 500)); return d; }
const SEASON_WORD = ["春", "夏", "初夏", "秋", "冬", "晩秋", "初春"];

// ---------------------------------------------------------------------
// タイトル生成用の語彙（[日本語, 英語]）
// ---------------------------------------------------------------------
const W_SEASON = [["春", "SPRING"], ["夏", "SUMMER"], ["秋", "AUTUMN"], ["冬", "WINTER"], ["初夏", "EARLY SUMMER"], ["晩秋", "LATE AUTUMN"], ["春休み", "SPRING BREAK"], ["夏休み", "SUMMER VACATION"]];
const W_PLACE = [["坂道", "THE SLOPE"], ["交差点", "THE CROSSING"], ["喫茶店", "THE CAFÉ"], ["屋上", "THE ROOFTOP"], ["並木道", "THE AVENUE"], ["港", "THE HARBOR"],
  ["図書館", "THE LIBRARY"], ["映画館", "THE CINEMA"], ["団地", "THE ESTATE"], ["海辺", "THE SEASIDE"], ["路地", "THE ALLEY"], ["駅前", "THE STATION"], ["プール", "THE POOL"],
  ["パン屋", "THE BAKERY"], ["銭湯", "THE BATHHOUSE"], ["踏切", "THE RAILROAD CROSSING"], ["商店街", "THE ARCADE"], ["灯台", "THE LIGHTHOUSE"], ["温室", "THE GREENHOUSE"], ["遊園地", "THE AMUSEMENT PARK"]];
const W_TIME = [["午前四時", "4 A.M."], ["真夜中", "MIDNIGHT"], ["放課後", "AFTER SCHOOL"], ["日曜日", "SUNDAY"], ["夕暮れ", "DUSK"], ["雨の日", "A RAINY DAY"],
  ["最後の夜", "THE LAST NIGHT"], ["十七歳", "SEVENTEEN"], ["月曜日", "MONDAY"], ["夜明け", "DAWN"], ["土曜の午後", "SATURDAY AFTERNOON"]];
const W_SOFT = [["手紙", "LETTERS"], ["約束", "PROMISE"], ["さよなら", "GOODBYE"], ["ひかり", "LIGHT"], ["忘れもの", "LEFT BEHIND"], ["秘密", "SECRET"], ["魔法", "MAGIC"],
  ["初恋", "FIRST LOVE"], ["ため息", "SIGHS"], ["子守唄", "LULLABY"], ["ラブソング", "LOVE SONG"], ["風景", "LANDSCAPE"]];
const W_DARK = [["影", "SHADOW"], ["囁き", "WHISPERS"], ["住人", "RESIDENT"], ["禁忌", "TABOO"], ["呪い", "CURSE"], ["足音", "FOOTSTEPS"], ["鏡", "MIRROR"], ["人形", "DOLL"], ["夜鳴き", "NIGHT CRY"]];
const W_THING = [["窓", "WINDOW"], ["部屋", "ROOM"], ["鍵", "KEY"], ["階段", "STAIRCASE"], ["扉", "DOOR"], ["電話", "CALL"], ["写真", "PHOTOGRAPH"], ["証言", "TESTIMONY"]];
const ORD = [["一", "FIRST"], ["二", "SECOND"], ["三", "THIRD"], ["四", "FOURTH"], ["五", "FIFTH"], ["七", "SEVENTH"], ["十三", "THIRTEENTH"]];
const W_CRIME = [["目撃者", "WITNESS"], ["共犯者", "ACCOMPLICE"], ["容疑者", "SUSPECT"], ["告発", "ACCUSATION"], ["取引", "DEAL"], ["密告", "TIP-OFF"], ["身代金", "RANSOM"]];

const G = {
  seasonPlace: () => { const s = pick(W_SEASON), p = pick(W_PLACE); return [`${s[0]}の${p[0]}で`, `${p[1]} IN ${s[1]}`]; },
  timePlace: () => { const t = pick(W_TIME), p = pick(W_PLACE); return [`${t[0]}、${p[0]}にて`, `${t[1]} AT ${p[1]}`]; },
  softOf: () => { const p = pick(W_PLACE), s = pick(W_SOFT); return [`${p[0]}の${s[0]}`, `${s[1]} OF ${p[1]}`]; },
  timeSoft: () => { const t = pick(W_TIME), s = pick(W_SOFT); return [`${t[0]}の${s[0]}`, `${t[1]} ${s[1]}`]; },
  darkPlace: () => { const p = pick(W_PLACE), d = pick(W_DARK); return [`${p[0]}の${d[0]}`, `THE ${d[1]} OF ${p[1].replace("THE ", "")}`]; },
  ordThing: () => { const o = pick(ORD), t = pick(W_THING); return [`${o[0]}番目の${t[0]}`, `THE ${o[1]} ${t[1]}`]; },
  timeCrime: () => { const t = pick(W_TIME), c = pick(W_CRIME); return [`${t[0]}の${c[0]}`, `${c[1]} AT ${t[1]}`]; },
  placeCrime: () => { const p = pick(W_PLACE), c = pick(W_CRIME); return [`${p[0]}の${c[0]}`, `${c[1]} AT ${p[1]}`]; },
};

// ---------------------------------------------------------------------
// 短評・映画祭
// ---------------------------------------------------------------------
const OUTLETS = ["シネマ週報", "映画日和", "月刊スクリーン手帖", "東亜キネマ通信", "夜の映画評", "フィルム・ノート", "週刊シネフィル", "映画と珈琲",
  "ミニシアター通信", "キネマ散歩", "THE REEL", "CINÉ JOURNAL"];
const REVIEWS = {
  quiet: ["今年いちばん静かで、いちばん泣ける。", "画面の隅々まで、愛おしい。", "見終わったあと、散歩がしたくなる。", "何気ない風景が、こんなにも美しい。",
    "静かな傑作。", "光の撮り方が、ずるい。", "観たあと、誰かに会いたくなる。", "忘れていた季節を思い出した。"],
  bold: ["息をするのを忘れた。", "最後の10分、震えが止まらない。", "今年最大の衝撃作。", "心臓に悪い。最高だ。", "あなたは、必ず騙される。",
    "瞬きできない128分。", "ジャンルを塗り替える一本。"],
  fun: ["劇場が笑いで揺れた。", "腹筋が持たない。", "こんな映画を待っていた！", "全員、どうかしてる（褒め言葉）。"],
};
const FESTIVALS = ["なんでも国際映画祭", "湾岸国際映画祭", "北の街映画祭", "ひかり映画祭", "東亜インディペンデント映画祭", "夜明け短編映画祭", "坂の上映画祭"];
const AWARDS = ["公式招待作品", "審査員特別賞", "観客賞", "最優秀作品賞", "監督賞", "新人監督賞", "グランプリ"];
function randomReviews(tone) {
  const qs = shuffled(REVIEWS[tone] || REVIEWS.quiet).slice(0, 3);
  const os = shuffled(OUTLETS);
  return qs.map((q, i) => [q, os[i]]);
}
function randomFestivals() {
  return shuffled(FESTIVALS).slice(0, randInt(1, 3)).map((f) => [`第${randInt(3, 48)}回 ${f}`, pick(AWARDS)]);
}

// ---------------------------------------------------------------------
// ジャンル別の素材
//   titles: 固定のタイトル  gen: タイトル生成パターン  taglines: コピー  date: 公開日の書き方
// ---------------------------------------------------------------------
const GENRES = {
  seishun: {
    label: "青春", tone: "quiet",
    titles: [["パンの匂いがする季節に", "THE SEASON SMELLS OF BREAD"], ["夏が終わる前に、君と", "BEFORE THE SUMMER ENDS"], ["放課後のプラネタリウム", "AFTER SCHOOL PLANETARIUM"],
      ["ぼくらの最終列車", "OUR LAST TRAIN"], ["坂の上の、まだ青い空", "THE STILL-BLUE SKY"], ["さよならは自転車の速さで", "GOODBYE AT BICYCLE SPEED"],
      ["銀杏並木で待ってる", "WAITING UNDER THE GINKGO"], ["ぼくらは今日も途中", "STILL ON OUR WAY"], ["きみの名前を呼ぶ練習", "PRACTICING YOUR NAME"],
      ["十八歳の地図", "MAP OF EIGHTEEN"], ["透明な夏の走り方", "HOW TO RUN A CLEAR SUMMER"], ["ただいま、青い日々", "HELLO AGAIN, BLUE DAYS"]],
    gen: [G.seasonPlace, G.timeSoft, G.softOf],
    taglines: ["あの秋、パンの匂いだけが本当のことを知っていた。", "言えなかったことは、全部ここに置いてきた。", "十七歳の僕らは、まだ何者でもなかった。",
      "この坂をのぼりきったら、きっと大人になる。", "忘れたくない一日が、ひとつだけある。", "走れ。夏が終わる前に。", "好きだった。ただ、それだけだった。",
      "放課後は、永遠に続くと思っていた。", "ぼくらの青は、まだ乾いていない。", "あの日の約束、まだ有効ですか。"],
    date: () => `${futureDate().getFullYear()}年 ${pick(SEASON_WORD)}、全国ロードショー`,
  },
  taiwan: {
    label: "台湾青春", tone: "quiet",
    titles: [["屋上で待ってて", "在屋頂等我"], ["きみの好きな歌", "你喜歡的歌"], ["最後の夏休み", "最後的暑假"], ["自転車と海", "單車與海"],
      ["雨の日の約束", "雨天的約定"], ["さよなら、十七歳", "再見，十七歲"], ["夜市で会おう", "夜市見"], ["きみがいた教室", "有你的教室"],
      ["ぼくらの青い季節", "我們的青春季節"], ["百回目の告白", "第一百次告白"], ["夏の終わりの花火", "夏末的煙火"]],
    taglines: ["あの頃のぼくらは、なんでもできる気がしていた。", "好きって言えなかった夏が、いちばん眩しい。", "きみの隣で、世界は少しだけ優しかった。",
      "大人になっても、あの屋上を覚えている。", "青春は、たぶん一度きりの通り雨。", "ずっと友達で、いたかった。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 公開`; },
  },
  korean: {
    label: "韓国映画風", tone: "quiet",
    titles: [["春の夜、パン屋で", "봄밤, 빵집에서"], ["きみの季節", "너의 계절"], ["さよならの温度", "안녕의 온도"], ["ゆっくり、遠くへ", "천천히, 멀리"],
      ["秋の手紙", "가을 편지"], ["ふたりの散歩道", "우리의 산책길"], ["最後の夏休み", "마지막 여름방학"], ["今日も、晴れ", "오늘도, 맑음"],
      ["窓辺の午後", "창가의 오후"], ["ひとりの食卓", "혼자의 식탁"], ["また明日、ここで", "내일 또, 여기서"], ["遠い灯り", "먼 불빛"]],
    taglines: ["何も起きない日々が、いちばん愛おしかった。", "あの日の私に、会いにいく。", "季節はめぐっても、きみは戻らない。",
      "ありふれた午後に、奇跡はあった。", "ここにいたことを、誰かが覚えていてくれたら。", "大丈夫じゃなくても、大丈夫。",
      "さよならの代わりに、ごはんを作った。", "私たちは、まだ途中にいる。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}年${d.getMonth() + 1}月 公開`; },
  },
  knoir: {
    label: "韓国ノワール", tone: "bold",
    titles: [["狼たちの街", "늑대들의 도시"], ["最後の取引", "마지막 거래"], ["沈黙の刃", "침묵의 칼날"], ["裏切りの夜", "배신의 밤"],
      ["獣の時間", "짐승의 시간"], ["名もなき証人", "이름 없는 증인"], ["血の契約", "피의 계약"], ["黒い水", "검은 물"],
      ["地下の王", "지하의 왕"], ["雨の追跡者", "비의 추격자"], ["審判の日", "심판의 날"]],
    taglines: ["生き残るのは、ただひとり。", "この街では、正義も金で買える。", "信じた瞬間、終わる。", "復讐は、まだ始まってもいない。",
      "最後に笑うのは、誰だ。", "悪には、悪で。", "守るために、すべてを壊す。", "この夜が、明けることはない。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}.${d.getMonth() + 1}`; },
  },
  minitheater: {
    label: "ミニシアター", tone: "quiet",
    titles: [["名前のない午後", "AN UNNAMED AFTERNOON"], ["ここにいる", "STILL HERE"], ["静かな水", "QUIET WATER"], ["遠くの音", "DISTANT SOUNDS"],
      ["わたしたちの家", "OUR HOUSE"], ["余白", "THE MARGIN"], ["春の練習", "PRACTICING SPRING"], ["光のあと", "AFTER THE LIGHT"], ["ささやかな日", "A MODEST DAY"]],
    gen: [G.timeSoft, G.softOf],
    taglines: ["ただ、そこにいた。", "何も言わなくていい時間があった。", "生活は、つづく。", "誰かの日常は、誰かの映画だ。",
      "光が、ゆっくり部屋を横切っていく。", "なにもない日の、なにか。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ROADSHOW`; },
  },
  nouvelle: {
    label: "フランス映画", tone: "quiet",
    titles: [["日曜日の恋人たち", "LES AMANTS DU DIMANCHE"], ["小さな嘘", "UN PETIT MENSONGE"], ["彼女のいない夏", "L'ÉTÉ SANS ELLE"],
      ["街角のカフェ", "LE CAFÉ DU COIN"], ["最後のダンス", "LA DERNIÈRE DANSE"], ["ふたりの距離", "LA DISTANCE ENTRE NOUS"],
      ["午後の光", "LA LUMIÈRE DE L'APRÈS-MIDI"], ["青い自転車", "LA BICYCLETTE BLEUE"], ["恋人たちの散歩", "LA PROMENADE DES AMANTS"], ["秘密のパン屋", "LA BOULANGERIE SECRÈTE"]],
    taglines: ["恋は、いつも少し遅れてやってくる。", "愛してる。でも、それだけじゃ足りない。", "人生は、ほとんど会話でできている。",
      "パリでもなく、東京でもない、どこか。", "ふたりは、まだ名前をつけていない。"],
    date: () => { const d = futureDate(); return `${d.getDate()} ${MONTH_FR[d.getMonth()]} ${d.getFullYear()}`; },
  },
  horror: {
    label: "ホラー", tone: "bold",
    titles: [["閉店時間", "CLOSING TIME"], ["くらやみ坂", "THE DARK SLOPE"], ["三番目の窓", "THE THIRD WINDOW"], ["ここに住んでいた", "SOMEONE LIVED HERE"],
      ["呼ぶ声", "THE CALLING"], ["忌み並木", "THE CURSED ROW"], ["返事をしてはいけない", "DON'T ANSWER"], ["うしろの正面", "BEHIND YOU"],
      ["誰もいない部屋", "THE EMPTY ROOM"], ["写ってはいけない", "NOT IN THE PICTURE"]],
    gen: [G.darkPlace, G.ordThing],
    taglines: ["その店は、百年前から一度も閉まったことがない。", "振り向いたら、終わり。", "あの窓に、誰かいる。", "この写真を撮ったのは、誰？",
      "夜になると、道がひとつ増える。", "決して、名前を呼んではいけない。", "あなたの後ろにも、きっと。", "見つけたら、見つかる。"],
    date: () => { const d = futureDate(); return `${d.getMonth() + 1}.${d.getDate()} ${WEEK_EN[d.getDay()]}`; },
    rating: () => pick(["R15+　深夜上映のみ", "PG12　ひとりで観ないでください", "R15+", "R18+　閲覧注意"]),
  },
  suspense: {
    label: "サスペンス", tone: "bold",
    titles: [["沈黙の交差点", "SILENT CROSSING"], ["第七の証言", "THE SEVENTH TESTIMONY"], ["偽りの街角", "THE FALSE CORNER"], ["午前四時の目撃者", "WITNESS AT 4 A.M."],
      ["影を売る男", "THE SHADOW DEALER"], ["見えない境界線", "INVISIBLE LINE"], ["72時間", "72 HOURS"], ["消えた乗客", "THE MISSING PASSENGER"]],
    gen: [G.timeCrime, G.placeCrime, G.ordThing],
    taglines: ["この街の誰もが、嘘をついている。", "真実は、いつもすぐそこに写っていた。", "残された時間は、あと72時間。", "犯人は、この中にいる。",
      "あなたが見ているものは、本物か。", "その日、街から音が消えた。", "疑え。自分さえも。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ROADSHOW`; },
  },
  mystery: {
    label: "ミステリー", tone: "bold",
    titles: [["名探偵と消えた時計", "THE VANISHED CLOCK"], ["七つの鍵", "SEVEN KEYS"], ["白い館の殺人", "MURDER IN THE WHITE MANOR"],
      ["時計塔の謎", "RIDDLE OF THE CLOCK TOWER"], ["幻の一頁", "THE PHANTOM PAGE"], ["密室の午後", "A LOCKED-ROOM AFTERNOON"], ["探偵と三つの嘘", "THREE LIES"]],
    gen: [G.ordThing, G.placeCrime],
    taglines: ["すべての手がかりは、最初から写っていた。", "謎は、パンが焼けるまでに解く。", "嘘はひとつ。容疑者は七人。", "その時計は、なぜ止まったのか。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEK[d.getDay()]}）解禁`; },
  },
  hk: {
    label: "香港ネオン", tone: "bold",
    titles: [["ネオンの果て", "霓虹盡頭"], ["真夜中の約束", "午夜的約定"], ["港のふたり", "港灣二人"], ["最後の取立て", "最後的追債"],
      ["雨の九龍", "九龍之雨"], ["夜の住人", "夜之住人"], ["狼の掟", "狼之規"], ["失われた午前三時", "失落的凌晨三點"]],
    taglines: ["この街の夜は、誰も眠らない。", "愛も裏切りも、ネオンの色に溶けていく。", "期限切れの恋に、もう一度だけ。", "生きるか、死ぬか。今夜決まる。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} 午夜上映`; },
  },
  romance: {
    label: "ロマンス", tone: "quiet",
    titles: [["きみと、ひだまりの午後", "AN AFTERNOON WITH YOU"], ["百年後も、この場所で", "STILL HERE IN A HUNDRED YEARS"], ["恋は焼きたてのうちに", "LOVE, FRESHLY BAKED"],
      ["雨上がりのプロポーズ", "AFTER THE RAIN"], ["ふたりの距離、あと一歩", "ONE STEP AWAY"], ["月曜日のラブレター", "MONDAY LOVE LETTER"],
      ["きみに会うための街", "A TOWN TO MEET YOU"], ["さよならまでの百日", "100 DAYS UNTIL GOODBYE"]],
    gen: [G.timeSoft, G.seasonPlace],
    taglines: ["運命は、いつもの帰り道に落ちていた。", "好きって、こんなに静かな気持ちだったんだ。", "あなたに会うために、この街に来た。",
      "最後の一ページは、ふたりで書こう。", "百回目の偶然は、もう運命でいい。", "この恋に、締め切りはない。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEK[d.getDay()]}）公開`; },
  },
  sf: {
    label: "SF", tone: "bold",
    titles: [["第九惑星の街角", "CORNER OF PLANET NINE"], ["タイムループ・ベーカリー", "TIME LOOP BAKERY"], ["2099年の散歩道", "PROMENADE 2099"],
      ["オービタル・シティ", "ORBITAL CITY"], ["記憶転送", "MEMORY TRANSFER"], ["最後の地上観測員", "THE LAST OBSERVER"], ["人類最後の日曜日", "HUMANITY'S LAST SUNDAY"],
      ["アンドロイドは銀杏の夢を見る", "ANDROIDS DREAM OF GINKGO"], ["シグナル・ゼロ", "SIGNAL ZERO"]],
    taglines: ["この景色は、千年後の地球から届いた。", "同じ朝が、もう三百回目。", "人類最後の一日が、始まる。", "その街は、地図から消えていた。",
      "未来は、もう写っている。", "時間は、まだ足りている。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`; },
  },
  fantasy: {
    label: "ファンタジー", tone: "quiet",
    titles: [["星降る街の物語", "TALE OF THE STARFALL TOWN"], ["魔法使いのパン屋", "THE WIZARD'S BAKERY"], ["時を渡る手紙", "THE LETTER ACROSS TIME"],
      ["銀色の森", "THE SILVER FOREST"], ["月の図書館", "LIBRARY OF THE MOON"], ["竜と銀杏の王国", "KINGDOM OF DRAGON AND GINKGO"], ["夜明けの魔法", "DAWN MAGIC"]],
    taglines: ["この街では、千年に一度だけ魔法が戻ってくる。", "扉の向こうは、もうひとつの世界。", "信じた者だけが、見つけられる。", "その願い、叶えてしんぜよう。"],
    date: () => `${futureDate().getFullYear()}年 ${pick(["春休み", "夏休み", "冬休み", "ゴールデンウィーク"])} 全国ロードショー`,
  },
  action: {
    label: "80sアクション", tone: "bold",
    titles: [["ラスト・ミッション", "LAST MISSION"], ["爆走ストリート", "STREET FURY"], ["ターゲットは午前零時", "TARGET: MIDNIGHT"], ["鋼鉄の拳", "FIST OF STEEL"],
      ["デッドライン72", "DEADLINE 72"], ["ブレイク・ポイント", "BREAK POINT"], ["怒りの銀杏通り", "FURY ON GINKGO AVE."], ["コード・レッド", "CODE RED"]],
    taglines: ["この夏、街が燃える。", "ルールは、ぶっ壊すためにある。", "ひとりで、全員倒す。", "爆発まで、あと60秒。", "最強の男が、帰ってきた。"],
    date: () => { const d = futureDate(); return `${d.getMonth() + 1}月${d.getDate()}日 超拡大ロードショー`; },
  },
  comedy: {
    label: "コメディ", tone: "fun",
    titles: [["パン屋、はじめました（無許可）", "BAKERY WITHOUT PERMISSION"], ["おじさん、走る！", "RUN, OJISAN, RUN!"], ["となりの大騒動", "THE NEXT-DOOR CHAOS"],
      ["家族旅行は戦場だ", "FAMILY TRIP WARS"], ["それ、ぜんぶ勘違い！", "IT'S ALL A MISTAKE!"], ["史上最弱の探偵団", "THE WEAKEST DETECTIVES"],
      ["定時で帰りたい勇者", "THE HERO WHO LEAVES AT FIVE"], ["うちの猫が社長です", "MY CAT IS THE CEO"], ["結婚式まであと3時間", "3 HOURS TO THE WEDDING"]],
    taglines: ["笑ってる場合じゃない。でも笑う。", "全米が困惑した。", "ぜったい、うまくいかない。", "大人のくせに、本気でふざける。",
      "今年いちばん、どうでもいい大事件。", "予告編がピーク……じゃない！"],
    date: () => { const d = futureDate(); return `${d.getMonth() + 1}月${d.getDate()}日 爆笑公開！`; },
  },
  doc: {
    label: "ドキュメンタリー", tone: "quiet",
    titles: [["この街のパン", "BREAD OF THIS TOWN"], ["百年続く店", "A HUNDRED-YEAR SHOP"], ["銀杏並木の一年", "A YEAR UNDER THE GINKGO"],
      ["名もなき日々", "NAMELESS DAYS"], ["朝五時の仕込み", "5 A.M. PREP"], ["路地の記憶", "MEMORIES OF THE ALLEY"], ["働く手", "WORKING HANDS"]],
    taglines: ["これは、あなたの街の物語かもしれない。", "変わらないために、毎日変わり続ける。", "カメラは、3年間まわり続けた。", "普通の人の、普通じゃない毎日。"],
    date: () => { const d = futureDate(); return `${d.getFullYear()}年${d.getMonth() + 1}月 ${pick(["ポレポレ座", "坂の上シネマ", "名画座ひかり", "銀杏シアター"])}ほか全国順次公開`; },
  },
  jidai: {
    label: "時代劇", tone: "bold",
    titles: [["月下の刃", "MOONLIT BLADE"], ["京の鬼", "THE DEMON OF KYO"], ["無宿の侍", "THE WANDERING SAMURAI"], ["雪の果て", "END OF SNOW"],
      ["鴨川残照", "AFTERGLOW ON THE KAMO"], ["百年の仇", "A CENTURY OF VENGEANCE"], ["斬る", "KIRU"], ["夜叉の道", "PATH OF THE YAKSHA"]],
    taglines: ["斬るか、斬られるか。", "この刀に、恥はない。", "その夜、京の都が燃えた。", "誓いは、血よりも重い。", "義のために、生きる。"],
    date: () => { const d = futureDate(); return `令和${kanjiNum(d.getFullYear() - 2018)}年 ${pick(["正月", "春", "盛夏", "秋"])} 大公開`; },
  },
  showa: {
    label: "昭和レトロ", tone: "fun",
    titles: [["銀杏通りの人々", "PEOPLE OF GINKGO STREET"], ["喫茶 夕暮れ", "CAFE YUGURE"], ["港町ブルース", "HARBOR TOWN BLUES"], ["下町人情物語", "A DOWNTOWN TALE"],
      ["さらば青春の街", "FAREWELL, YOUTH TOWN"], ["夜汽車", "NIGHT TRAIN"], ["若者たちの季節", "SEASON OF THE YOUNG"], ["東京ど真ん中", "DEAD CENTER OF TOKYO"]],
    taglines: ["あの頃、この街には夢があった。", "涙と笑いの、人情巨編。", "男は黙って、パンを焼く。", "ふるさとは、いつも遠くにありて。",
      "総天然色　大感動作！", "全国民、待望の映画化！"],
    date: () => { const d = futureDate(); return `昭和${kanjiNum(d.getFullYear() - 1925)}年 ${kanjiNum(d.getMonth() + 1)}月 封切`; },
  },
};

function randomTitle(g) {
  const gg = GENRES[g];
  if (gg.gen && chance(0.45)) return pick(gg.gen)();
  return pick(gg.titles);
}

function randomContent(genreKey) {
  const g = GENRES[genreKey];
  const [title, en] = randomTitle(genreKey);
  return {
    title, en,
    tagline: pick(g.taglines),
    cast: randomCast(randInt(2, 5)).join("、"),
    director: randomName(),
    date: g.date(),
    staff: randomStaff(),
    reviews: randomReviews(g.tone),
    festivals: randomFestivals(),
  };
}
