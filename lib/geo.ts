/**
 * Ray casting アルゴリズムで点が選択エリア内にあるか判定
 */
export function isPointInArea(
  point: [number, number],
  area: [number, number][]
): boolean {
  const [px, py] = point;
  let inside = false;

  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    const [xi, yi] = area[i];
    const [xj, yj] = area[j];

    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}
