---
marp: true
theme: default
paginate: true
---

# Pencil × Claude Code で変わる開発体験
## 2026.03.11 LT

---

# 自己紹介

- 大嶋 寛之
- AI歴ざっくり1年半

---

# 私のAIツール遍歴

| 時期 | ツール | 使い方 |
|------|--------|--------|
| 2024.05〜 | GitHub Copilot | 単語補完とMarkdown化だけ |
| 2025.05頃〜 | v0 | 叩き台デザインは作れた。既存コードからは無理 |
| 2025.06頃〜 | Cursor + Claude | コード全体を理解してくれて会話が噛み合う |
| 2025後半〜 | Claude Code CLI | 並列Issue対応、MCPで世界が広がる |

---

# そんな中で出会った Pencil

- **「Design on canvas. Land in code.」**
- IDE内で使えるデザインキャンバスツール
- https://www.pencil.dev/

---

# Pencil MCP × Claude Code

- MCP経由でClaude CodeがPencilのキャンバスを読み書きできる
- 自然言語でデザイン設計を依頼できる
- デザイン → コード が直接つながる

---

# 導入方法（簡単3ステップ）

1. **Pencilアプリ** → pencil.dev から `.dmg` をDL → インストール
2. **Claude Code CLI** → `npm install -g @anthropic-ai/claude-code-cli`
3. **VSCode / Cursor拡張** → Marketplaceで「Pencil」を検索
4. **MCP** → Pencil起動で自動接続（設定不要）

---

# ここが良かった

- **デザインの差分がgitで追える**
  - push後にCursorで差分確認できる
  - コードレビューと同じ感覚でデザインレビュー

- **デザイン設計をAIに任せられる**
  - 「こんな感じのUIで」→ キャンバス上に反映

---

# デモ

<!-- 細かいデモをここで実演 -->

---

# まとめ

- AIツールは **使い方が変わってきた**
  - 補完 → 会話 → 自律 → デザインまで
- Pencil MCP で **デザインとコードの壁がなくなる**
- まずは触ってみよう

---

# ありがとうございました！

質問あればどうぞ
