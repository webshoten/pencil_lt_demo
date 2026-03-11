# MapEstate 実装仕様

## やること

地図上をフリーハンドで囲む → 囲んだ範囲内の不動産物件を右パネルに一覧表示する。
LTデモ用。バックエンドなし、モックデータのみ。

---

## 実現方法

### 地図表示

- Leaflet + React Leaflet で地図を表示
- タイルは OpenStreetMap（無料、APIキー不要）
- Next.js の SSR で Leaflet は動かないため `dynamic(() => import(...), { ssr: false })` で読み込む
- 初期表示: 東京駅付近 `[35.6812, 139.7671]` zoom 13

### フリーハンド描画

- Leaflet Draw の `L.Draw.Polygon` はクリックベースなのでそのままでは使えない
- 代わりに Leaflet の map イベントを直接使ってフリーハンドを実現:
  - `mousedown` → 座標収集開始、地図ドラッグ無効化
  - `mousemove` → 座標を配列に追加、`L.polyline` でリアルタイム描画
  - `mouseup` → 選択エリア確定、地図ドラッグ再有効化
- 選択エリアは常に1つだけ。新しく囲むと前のエリアは消える
- 描画完了時に `onAreaCreated(latlngs)` コールバックで親に通知

### 選択エリア作成時の挙動と実装

#### ユーザー操作

1. 投げ縄ツールが選択された状態で、地図上をマウスでドラッグ
2. ドラッグ中、マウスの軌跡がリアルタイムで線として描かれる
3. マウスを離すと、始点と終点が自動的につながり閉じた領域になる
4. 右パネルに、その領域内の物件だけが表示される

#### 実装の流れ（MapView.tsx 内）

```
mousedown
  → 地図のドラッグを無効化（map.dragging.disable()）
  → 座標の配列を初期化（points = []）
  → もし既存の選択エリアがあれば削除（map.removeLayer）

mousemove（mousedown中のみ）
  → 現在のマウス座標（latlng）を points に push
  → L.polyline で points をリアルタイム描画（前フレームの線を更新）

mouseup
  → 地図のドラッグを再有効化（map.dragging.enable()）
  → points の始点と終点をつないで L.polygon を生成し地図に追加
  → 描画中の L.polyline は削除
  → onAreaCreated(points) で親コンポーネントに座標配列を渡す
```

#### 親コンポーネント（MapContainer.tsx）での処理

```
onAreaCreated(points) を受け取る
  → setSelectedArea(points)
  → useEffect が発火:
    - POST /api/properties/search に { area: points, filter } を送信
    - API Route 内で isPointInArea() による判定 + フィルタリング
    - レスポンスの物件配列を setFilteredProperties
  → PropertyPanel が再レンダリング（件数 + カード一覧が変わる）
  → MapView のマーカーも再レンダリング（エリア内: ティール、外: グレー）
```

#### 注意点

- mousedown → mousemove → mouseup の間、地図のパン操作と競合するため、投げ縄モード中は `map.dragging.disable()` が必須
- ハンドツールに切り替えた時は通常の地図操作に戻す（描画イベントをリッスンしない）
- 座標収集の間隔が細かすぎるとポイント数が膨大になるため、mousemove では前回の座標と一定距離（例: 5px）以上離れた時のみ追加する

### 選択エリア内判定

- Ray casting アルゴリズムで「点が選択エリア内か」を判定
- 全物件（20件）をループして判定（少数なので最適化不要）
- `lib/geo.ts` に `isPointInArea(point, area)` として切り出す

### 物件フィルタリング（API Route）

- `POST /api/properties/search` で処理
- リクエスト: `{ area: [number, number][], filter: FilterType }`
- レスポンス: `{ properties: Property[], count: number }`
- 処理内容:
  1. mockData の全物件に対して `isPointInArea()` で選択エリア内かを判定
  2. filter が `"all"` でなければ priceType でさらに絞り込み
  3. 結果を返す
- 今はモックデータだが、将来的にDB検索に差し替えやすい構造

### 状態管理

ページレベルの `useState` のみ。外部ライブラリ不使用。

| 状態 | 型 | 初期値 | 用途 |
|------|-----|--------|------|
| selectedArea | `LatLng[] \| null` | `null` | 描画された選択エリアの座標 |
| filter | `FilterType` | `"all"` | フィルタータブ |
| filteredProperties | `Property[]` | `[]` | APIから返された物件一覧 |
| selectedId | `string \| null` | `null` | マーカークリックで選択中の物件 |
| isLoading | `boolean` | `false` | API通信中フラグ |

page.tsx はサーバーコンポーネント。状態はクライアントラッパー（`MapContainer.tsx`）で管理し子に渡す。

### マーカー連動

- 全物件の座標にマーカー配置
- 選択エリア内: ティール色、外: グレー（opacity 0.4）
- マーカークリック → 右パネルの該当カードへ `scrollIntoView`

---

## イベントフロー

```
投げ縄で地図ドラッグ → 選択エリア生成 → setSelectedArea → API呼び出し → パネル更新
フィルタータブ切替   → setFilter → API呼び出し → パネル更新
マーカークリック     → setSelectedId → パネル内カードへスクロール＆ハイライト
新しいエリア描画   → 既存エリア削除 → 上記フロー繰り返し
```

---

## ファイル構成

```
app/
├── layout.tsx              # フォント（Inter, JetBrains Mono）
├── page.tsx                # サーバーコンポーネント。レイアウトのみ
├── globals.css             # Tailwind + CSS変数
├── api/
│   └── properties/
│       └── search/
│           └── route.ts    # POST: 選択エリア内の物件を返す
components/
├── Header.tsx              # ロゴ + 検索バー（見た目のみ）
├── MapContainer.tsx        # "use client" 状態管理ラッパー
├── MapView.tsx             # "use client" dynamic import。Leaflet地図+描画
├── PropertyPanel.tsx       # 物件一覧パネル
├── PropertyCard.tsx        # 物件カード1件
└── FilterTabs.tsx          # すべて/売買/賃貸切替
lib/
├── types.ts                # Property, FilterType 等
├── mockData.ts             # ダミーデータ20件
└── geo.ts                  # isPointInArea()
```

---

## 型定義

```typescript
export type PriceType = "sale" | "rent";
export type FilterType = "all" | "sale" | "rent";

export interface Property {
  id: string;
  title: string;          // "渋谷区神南 3LDK マンション"
  price: number;          // 売買: 円、賃貸: 月額円
  priceType: PriceType;
  area: number;           // ㎡
  age: number;            // 築年数
  walkMinutes: number;    // 駅徒歩分
  station: string;        // 最寄り駅名
  layout: string;         // 間取り
  buildingType: string;   // マンション/アパート/一戸建て
  thumbnailUrl: string;
  lat: number;
  lng: number;
}
```

---

## モックデータ

- 20件程度。東京23区内（lat: 35.63〜35.73, lng: 139.65〜139.80）
- 売買/賃貸を半々
- サムネイルはプレースホルダー画像（SVGまたは外部URL）

---

## スコープ外

- 検索バーの実機能
- 物件詳細ページ
- レスポンシブ（デスクトップのみ）
- DB連携（現在はモックデータだがAPI Routeの中身を差し替えれば対応可能）
- 認証・お気に入り

---

## デザイン参照

見た目は Pencil ファイル参照: `docs/pencil-new.pen`
