/*
 * identity-graph block — the RTCDP "scattered IDs → one profile" visual.
 * Authoring: a table whose first cell says "Identity Graph"; each following row
 * is one identity:  | Namespace | Value | Auth state | Primary? |
 */

const NS = 'http://www.w3.org/2000/svg';

function renderGraph(ids) {
  const wrap = document.createElement('div');
  wrap.className = 'ig-wrap';

  const W = 600;
  const cx = 140;
  const rx = 340;
  const CARD = 66;
  const GAP = 13;
  const PADY = 16;
  const STEP = CARD + GAP;
  const H = Math.max(210, ids.length <= 1
    ? PADY * 2 + CARD
    : PADY * 2 + ids.length * CARD + (ids.length - 1) * GAP);
  const cy = H / 2;

  // Pre-compute each card's vertical centre so we never mutate the id objects.
  const centres = ids.map((it, i) => {
    const top = ids.length === 1 ? (H - CARD) / 2 : PADY + i * STEP;
    return top + CARD / 2;
  });

  const graph = document.createElement('div');
  graph.className = 'ig-graph';
  graph.style.width = `${W}px`;
  graph.style.height = `${H}px`;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'ig-graph__svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  ids.forEach((it, i) => {
    const y = centres[i];
    const midx = (cx + rx) / 2;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${cx + 46},${cy} C${midx},${cy} ${midx},${y} ${rx - 2},${y}`);
    p.setAttribute('class', `ig-graph__link${it.primary ? ' is-primary' : ''}`);
    svg.append(p);
  });
  graph.append(svg);

  const hub = document.createElement('div');
  hub.className = 'ig-hub';
  hub.style.left = `${cx - 46}px`;
  hub.style.top = `${cy - 46}px`;
  hub.innerHTML = '<span class="ig-hub__ic">◎</span><b>Unified profile</b><span>Real-Time CDP</span>';
  graph.append(hub);

  ids.forEach((it, i) => {
    const el = document.createElement('div');
    el.className = `ig-node${it.primary ? ' is-primary' : ''}`;
    el.style.left = `${rx}px`;
    el.style.top = `${centres[i] - CARD / 2}px`;
    el.innerHTML = `<div class="ig-node__ns">${it.ns}${it.primary ? ' <span class="ig-node__pri">primary</span>' : ''}</div>`
      + `<code class="ig-node__val">${it.val.length > 26 ? `${it.val.slice(0, 24)}…` : it.val}</code>`
      + `<span class="ig-node__auth ig-node__auth--${it.auth}">${it.auth}</span>`;
    graph.append(el);
  });

  wrap.append(graph);

  const note = document.createElement('p');
  note.className = 'ig-note';
  note.innerHTML = '<b>Identity stitching</b> is the platform realising these scattered ids all belong to '
    + 'one person and gluing them into a single profile — like recognising that "the person at the counter", '
    + '"the online order" and "the loyalty card" are all you.';
  wrap.append(note);
  return wrap;
}

export default function decorate(block) {
  const ids = [...block.children].map((row) => {
    const cells = [...row.children].map((c) => c.textContent.trim());
    return {
      ns: cells[0] || '',
      val: cells[1] || '',
      auth: (cells[2] || 'ambiguous').toLowerCase(),
      primary: /^(y|yes|true|primary)$/i.test(cells[3] || ''),
    };
  }).filter((d) => d.ns);

  block.textContent = '';
  block.append(renderGraph(ids));
}
